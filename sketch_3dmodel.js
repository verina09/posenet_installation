let rightArm, rightElbow, rightHand;
let leftArm, leftElbow, leftHand;
let rightUpLeg, rightLeg, rightFoot;
let leftUpLeg, leftLeg, leftFoot;

var stats = new Stats();
stats.showPanel( 0 );  // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const width = window.innerWidth; //600;
const height = window.innerHeight; //600;

// ithink this is making the video terribly small.. not sure if processed correctly
const videoWidth = 300//window.innerWidth
const videoHeight = 150//window.innerHeight

const trackerScaleFactor = 1;
const trackerOffsetX = width*0.6;
const trackerOffsetY = height*0.1;
const showVideo = true;

// Setup scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );

//  We use an orthographic camera here instead of persepctive one for easy mapping
//  Bounded from 0 to width and 0 to height
// Near clipping plane of 0.1; far clipping plane of 1000
const camera = new THREE.OrthographicCamera(0,width,0,height, 0.1, 1000);
camera.position.z = 500;
// const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10 );
// camera.position.set( 2, 2, - 2 );

//window.addEventListener("resize", onWindowResize);

// GLTF model
const gltfLoader = new THREE.GLTFLoader();
//gltfLoader.load( 'https://threejs.org/examples/models/gltf/Soldier.glb', function ( gltf ) {
gltfLoader.load( './Skeleton_Rigged.glb', function ( gltf ) {

	const model = gltf.scene;

	gltf.scene.traverse(child => {
    if (child.material) {
        let material = new THREE.MeshBasicMaterial();
        material.map = child.material.map;
        material.alphaMap = child.material.map;
        material.alphaTest = 0.5;
        material.skinning = true;
        material.side = THREE.DoubleSide;
        child.material = material;
        child.material.needsUpdate = true;
    }
	})

	// //right arm
	// rightArm = model.getObjectByName( 'mixamorigRightArm' );
	// rightElbow = model.getObjectByName( 'mixamorigRightForeArm' );
	// rightHand = model.getObjectByName( 'mixamorigRightHand' );
	//
	// //left arm
	// leftArm = model.getObjectByName( 'mixamorigLeftArm' );
	// leftElbow = model.getObjectByName( 'mixamorigLeftForeArm' );
	// leftHand = model.getObjectByName( 'mixamorigLeftHand' );
	//
	// //right leg
	// rightUpLeg = model.getObjectByName( 'mixamorigRightUpLeg' );
	// rightLeg = model.getObjectByName( 'mixamorigRightLeg' );
	// rightFoot = model.getObjectByName( 'mixamorigRightFoot' );
	//
	// //left leg
	// leftUpLeg = model.getObjectByName( 'mixamorigLeftUpLeg' );
	// leftLeg = model.getObjectByName( 'mixamorigLeftLeg' );
	// leftFoot= model.getObjectByName( 'mixamorigLeftFoot' );

	//right arm
	rightArm = model.getObjectByName( 'Skeleton_RightArm' );
	rightElbow = model.getObjectByName( 'Skeleton_RightForearm' );
	rightHand = model.getObjectByName( 'Skeleton_RightHandArm' );

	//left arm
	leftArm = model.getObjectByName( 'Skeleton_LeftArm' );
	leftElbow = model.getObjectByName( 'Skeleton_LeftForearm' );
	leftHand = model.getObjectByName( 'Skeleton_LeftHandArm' );

	//right leg
	rightUpLeg = model.getObjectByName( 'Skeleton_RightThigh' );
	rightLeg = model.getObjectByName( 'Skeleton_RightCalf' );
	rightFoot = model.getObjectByName( 'Skeleton_RightFoot' );

	//left leg
	leftUpLeg = model.getObjectByName( 'Skeleton_LeftThigh' );
	leftLeg = model.getObjectByName( 'Skeleton_LeftCalf' );
	leftFoot= model.getObjectByName( 'Skeleton_LeftFoot' );

  // //model.scale.set(0.001, 0.001, 0.001);
  // model.scale.set(300,300,300);
	// model.rotation.set(0,3.14,3.14)
	// model.position.set(300, 600, 0);//(new THREE.Vector3(100, 100, 0));

	//model.scale.set(0.001, 0.001, 0.001);
	model.scale.set(100,100,100);
	model.rotation.set(0,3.14,3.14)
	model.position.set(300, 500, 1);

    var bbox = new THREE.Box3().setFromObject(model);
    var cent = bbox.getCenter(new THREE.Vector3());
    var size = bbox.getSize(new THREE.Vector3());
    // //Rescale the object to normalized space
    // var maxAxis = Math.max(size.x, size.y, size.z);
    // model.scale.multiplyScalar(1.0 / maxAxis);
    // bbox.setFromObject(model);
    // bbox.getCenter(cent);
    // bbox.getSize(size);
    // //Reposition to 0,halfY,0
    // model.position.copy(cent).multiplyScalar(-1);
    // model.position.y-= (size.y * 0.5);
		//
	//console.log(cent, size)

	// gltf.scene.traverse( function ( child ) {
	//     if ( child.isMesh ) {
	//         console.log(child.geometry.attributes.position)
	//     }
	// })

	scene.add( model );
} );

// Setting up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width, height );
renderer.setClearColor( 0xffffff, 0);

// Attach the threejs animation to the div with id of threeContainer
const container = document.getElementById( 'threeContainer' );
container.appendChild( renderer.domElement );


const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const hemiLight     = new THREE.HemisphereLight('#EFF6EE', '#EFF6EE', 1 );
hemiLight.position.set( 0, 0, 0 );
scene.add( hemiLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff );
scene.add( directionalLight );

//renderer.render( scene, camera );

//console.log(scene)
const group = new THREE.Group();

// Creating Tracker class
function Tracker(){
  this.position = new THREE.Vector3();

  const geometry = new THREE.SphereGeometry(10,7,7);
  const material = new THREE.MeshToonMaterial({ color: 0xEFF6EE,
                                              opacity:0.5,
                                              transparent:true,
                                              wireframe:true,
                                              emissive: 0xEFF6EE,
                                              emissiveIntensity:1})

  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  this.initialise = function() {
    this.position.x = -10;
    this.position.y = -10;
    this.position.z = 0;
  }

  this.update = function(x,y,z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  this.display = function() {
    sphere.position.x = this.position.x;
    sphere.position.y = this.position.y;
    sphere.position.z = this.position.z;
  }
}

// Creating Skeleton class
function Skeleton(){

  const MAX_POINTS = 2;
  const geometry = new THREE.BufferGeometry();

  // attributes
  this.positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
  geometry.setAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ) );

  // material - note: line thickness will always be 1, despite the value (webGL limitation)
  const material = new THREE.LineBasicMaterial( { color: '#40E0D0', linewidth: 1 } );

  const line = new THREE.Line( geometry, material );
  group.add(line);

  this.initialise = function() {
    this.positions = line.geometry.attributes.position.array;

    //currently, there are only 2 points
    this.positions[0] = 0;
    this.positions[1] = 0;
    this.positions[2] = 0;

    this.positions[3] = 10;
    this.positions[4] = 10;
    this.positions[5] = 0;
  }

  this.update = function(x1,y1,x2,y2){
    this.positions[0] = x1;
    this.positions[1] = y1;
    this.positions[2] = 0;

    this.positions[3] = x2;
    this.positions[4] = y2;
    this.positions[5] = 0;
  }

  this.display = function() {

    //line.geometry.attributes.position = this.positions;
    line.geometry.attributes.position.needsUpdate = true;

  }
}

scene.add( group );

// POSENET
// Check on the device that you are viewing it from
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

// Load camera
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth//width;
  video.height = videoHeight//height;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

// Net will hold the posenet model
let net;
let keyP; //FOR 3D MODEL

// Initialise trackers to attach to body parts recognised by posenet model
let trackers = [];
for (let i=0; i<17; i++){
  let tracker = new Tracker();
  tracker.initialise();
  tracker.display();

  trackers.push(tracker);
}

let skeletons = []
for(let i=0;i<12;i++){
  let skeleton = new Skeleton();
  skeleton.initialise();

  skeletons.push(skeleton);
}

// Main animation loop
function render(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  // Flip the webcam image to get it right
  const flipHorizontal = true;

	canvas.width = videoWidth;
	canvas.height = videoHeight;

	var lowConfidenceIndex;

	const skeletonPairList = [[5,6],[5,7],[7,9],
											[6,8],[8,10],[12,11],
											[11,13],[13,15],[12,14],
											[14,16],[6,12],[5,11]]
	var drawSkeletonIndex;

  async function detect() {

		lowConfidenceIndex = []
		//drawSkeletonIndex = []

    // Load posenet
    net = await posenet.load();

    // Scale the image. The smaller the faster
    const imageScaleFactor = 0.75;

    // Stride, the larger, the smaller the output, the faster
    const outputStride = 32;

    // Store all the poses
    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;

    //capture pose
    const pose = await net.estimateSinglePose(video,
                                              imageScaleFactor,
                                              flipHorizontal,
                                              outputStride);
    poses.push(pose);


    // Show a pose (i.e. a person) only if probability more than 0.1
    minPoseConfidence = 0.1;
    // Show a body part only if probability more than 0.3
    minPartConfidence = 0.3;

    //ctx.clearRect(0, 0, width, height);
		ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      //ctx.translate(-width, 0);
			ctx.translate(-videoWidth, 0);
      // ctx.filter = 'blur(5px)';
      ctx.filter = 'opacity(70%) blur(1px) grayscale(100%)';
      //ctx.drawImage(video, 0, 0,width,height)
      ctx.drawImage(video, 0, 0,videoWidth, videoHeight)
			ctx.restore();
    }

    //process pose (confidence score)
    poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {

        var xList = [];
        var yList = [];
        keypoints.forEach((d,i)=>{

          var xPos, yPos;
          if(d.score>minPartConfidence){

          // Positions need some scaling
          xPos = d.position.x*trackerScaleFactor*-1+trackerOffsetX;
          yPos = d.position.y*trackerScaleFactor+trackerOffsetY;//-height/4;
          }
          // Move out of screen & store index (for skeleton drawing) if body part not detected
          else if(d.score<minPartConfidence){
          xPos = -10;
          yPos = -10;

					lowConfidenceIndex.push(i)
          }

          trackers[i].update(xPos, yPos,0);
          trackers[i].display();

          xList.push(xPos);
          yList.push(yPos);
        })

        //copy keypoints
        keyP = keypoints

				//get skeleton display index
				for (var k = 0; k < skeletonPairList.length; k++) {
					//console.log(k)
					if(!lowConfidenceIndex.some(v => skeletonPairList[k].includes(v))) //not found
					{
						//console.log('true')
						var id1 = skeletonPairList[k][0]
						var id2 = skeletonPairList[k][1]

						console.log(k, xList[id1], yList[id1],xList[id2], yList[id2])
						skeletons[k].update(xList[id1], yList[id1],xList[id2], yList[id2]);
						//skeletons[k].display();
					}
					else //one of it is in lowConfidenceIndex, so draw both outputStride
						skeletons[k].update(-10,-10,-10,-10);

					skeletons[k].display();
				}
      }

      net.dispose();
    });

stats.begin();


    //transferring keypoints to model
    if (keyP != null) {
    		if ( rightArm) {
    			if ( rightElbow ) {
    				if (keyP[7].score > minPartConfidence) {
    					if (keyP[5].score > minPartConfidence) {
    						let diagX = keyP[5].position.x - keyP[7].position.x;
    						let diagY = keyP[5].position.y - keyP[7].position.y;
    						let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

    						let normX = keyP[5].position.x - keyP[7].position.x;
    						let normDist = Math.sqrt( normX*normX );

    						rightArm.rotation.z = Math.acos(normDist / diagDist);
    					}

    					if ( rightHand ) {
    						if (keyP[9].score > minPartConfidence) {
    							let diagX = keyP[7].position.x - keyP[9].position.x;
    							let diagY = keyP[7].position.y - keyP[9].position.y;
    							let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

    							let normX = keyP[7].position.x - keyP[9].position.x;
    							let normDist = Math.sqrt( normX*normX );

    							rightElbow.rotation.z = Math.acos(normDist / diagDist);
    						}
    					}
    				}
    			}
    		}

    		if ( leftArm ) {
    			if ( leftElbow ) {
    				if (keyP[8].score > minPartConfidence) {
    					if (keyP[6].score > minPartConfidence) {
    						let diagX = keyP[6].position.x - keyP[8].position.x;
    						let diagY = keyP[6].position.y - keyP[8].position.y;
    						let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

    						let normX = keyP[6].position.x - keyP[8].position.x;
    						let normDist = Math.sqrt( normX*normX );

    						leftArm.rotation.z = Math.acos(normDist / diagDist);
    					}

    					if ( leftHand ) {
    						if (keyP[10].score > minPartConfidence) {
    							let diagX = keyP[8].position.x - keyP[10].position.x;
    							let diagY = keyP[8].position.y - keyP[10].position.y;
    							let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

    							let normX = keyP[8].position.x - keyP[10].position.x;
    							let normDist = Math.sqrt( normX*normX );

    							leftElbow.rotation.z = Math.acos(normDist / diagDist);
    						}
    					}
    				}
    			}
    		}

				if ( rightUpLeg) {
					if ( rightLeg) {
						if (keyP[13].score > minPartConfidence) {
							if (keyP[11].score > minPartConfidence) {
								let diagX = keyP[11].position.x - keyP[13].position.x;
								let diagY = keyP[11].position.y - keyP[13].position.y;
								let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

								let normX = keyP[11].position.x - keyP[13].position.x;
								let normDist = Math.sqrt( normX*normX );

								rightUpLeg.rotation.z = Math.acos(normDist / diagDist);
							}

							if ( rightFoot ) {
								if (keyP[15].score > minPartConfidence) {
									let diagX = keyP[13].position.x - keyP[15].position.x;
									let diagY = keyP[13].position.y - keyP[15].position.y;
									let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

									let normX = keyP[13].position.x - keyP[15].position.x;
									let normDist = Math.sqrt( normX*normX );

									rightLeg.rotation.z = Math.acos(normDist / diagDist);
								}
							}
						}
					}
				}

				if ( leftUpLeg ) {
					if ( leftLeg ) {
						if (keyP[14].score > minPartConfidence) {
							if (keyP[12].score > minPartConfidence) {
								let diagX = keyP[12].position.x - keyP[14].position.x;
								let diagY = keyP[12].position.y - keyP[14].position.y;
								let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

								let normX = keyP[12].position.x - keyP[14].position.x;
								let normDist = Math.sqrt( normX*normX );

								leftUpLeg.rotation.z = Math.acos(normDist / diagDist);
							}

							if ( leftFoot ) {
								if (keyP[16].score > minPartConfidence) {
									let diagX = keyP[14].position.x - keyP[16].position.x;
									let diagY = keyP[14].position.y - keyP[16].position.y;
									let diagDist = Math.sqrt( diagX*diagX + diagY*diagY );

									let normX = keyP[14].position.x - keyP[16].position.x;
									let normDist = Math.sqrt( normX*normX );

									leftLeg.rotation.z = Math.acos(normDist / diagDist);
								}
							}
						}
					}
				}
    	}


    renderer.render( scene, camera );
		stats.end();

		requestAnimationFrame(detect);
  }

  detect();

}

//console.log(scene)
async function main() {

  // Load posenet
  const net = await posenet.load();

  //document.getElementById('main').style.display = 'block';
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  render(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


main();


//----------------------
//currently, onWindowResize is not activated
//need to think how to adapt video & net accordingly otherwise -- scale factor, sensitivity, etc?
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
