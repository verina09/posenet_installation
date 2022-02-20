//import * as THREE from 'three';

// import { OrbitControls } from './OrbitControls.js';
//const OrbitControls = require('./OrbitControls.js')

let camera, scene, renderer;

init();
render();

function init() {

const container = document.createElement( 'div' );
document.body.appendChild( container );

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
camera.position.set( - 1.8, 0.6, 2.7 );

scene = new THREE.Scene();
scene.background = new THREE.Color( 0xFFFFFF );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const gltfLoader = new THREE.GLTFLoader();

//gltfLoader.load( './Skeleton_Rigged.glb', function ( gltf ) {
//gltfLoader.load( './skeleton3.glb', function ( gltf ) {
gltfLoader.load( './skeleton3.glb', function ( gltf ) {

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
});

  scene.add( model );
} );
  
// gltfLoader.load( './Soldier.glb', function ( gltf ) {

// 	const model = gltf.scene;

// 	scene.add( model );
// } );

// Scene lighting
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const hemiLight     = new THREE.HemisphereLight('#EFF6EE', '#EFF6EE', 1 );
hemiLight.position.set( 0, 0, 0 );
scene.add( hemiLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff );
scene.add( directionalLight );

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setClearColor( 0xffffff, 0);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;
//renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild( renderer.domElement );

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.addEventListener( 'change', render ); // use if there is no animation loop
controls.minDistance = 2;
controls.maxDistance = 10;
controls.target.set( 0, 0, - 0.2 );
controls.update();

window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize( window.innerWidth, window.innerHeight );

render();

}

//

function render() {

renderer.render( scene, camera );

}

//export { mm };