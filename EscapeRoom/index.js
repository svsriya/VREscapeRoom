
var scene, camera, renderer;
var controls;
var objects = [];
var raycaster;
var moveForward = false;
var moveBack = false;
var moveRight = false;
var moveLeft = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();

window.onload = function init()
{
  // setting the scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.lookAt( new THREE.Vector3(15,10,20) );
  camera.position.z = 3;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // add this in case the window is resized
  window.addEventListener( 'resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
  });

  // pointer lock controls
  controls = new THREE.PointerLockControls( camera, document.body );
  scene.add( controls.getObject() )

  // this is for checking what key was clicked
  var onKeyDown = function(event){

    switch( event.keyCode )
    {
      case 38: // up arrow key
        moveForward = true;
        break;
      case 37:  // left arrow key
        moveLeft = true;
        break;
      case 40:  // down arrow key
        moveBack = true;
        break;
      case 39:  // right arrow key
        moveRight = true;
        break;
    }
  };

  // after the key is released
  var onKeyUp = function(event){

    switch( event.keyCode )
    {
      case 38: // up arrow key
        moveForward = false;
        break;
      case 37:  // left arrow key
        moveLeft = false;
        break;
      case 40:  // down arrow key
        moveBack = false;
        break;
      case 39:  // right arrow key
        moveRight = false;
        break;
    }
  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0,-1,0), 0, 10);

  // create the empty room
  // floor
  var floorGeometry = new THREE.CubeGeometry(15, 1, 20);
  var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x6f3610, wireframe: false });
  var floorCube = new THREE.Mesh(floorGeometry, floorMaterial);
  floorCube.position.y = -5;
  scene.add( floorCube );

  // ceiling
  var ceilingGeometry = new THREE.CubeGeometry(15, 1, 20);
  var ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xdfdfdf, wireframe: false });
  var ceilingCube = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceilingCube.position.y = 5;
  scene.add( ceilingCube );

  // left wall
  var leftWallGeometry = new THREE.CubeGeometry(1, 10, 20);
  var leftWallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });
  var leftWallCube = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
  leftWallCube.position.x = -8;
  scene.add( leftWallCube );

  // right wall
  var rightWallGeometry = new THREE.CubeGeometry(1, 10, 20);
  var rightWallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });
  var rightWallCube = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
  rightWallCube.position.x = 8;
  scene.add( rightWallCube );

  // front wall
  var frontWallGeometry = new THREE.CubeGeometry(15, 10, 1);
  var frontWallMaterial = new THREE.MeshBasicMaterial({ color: 0xfdfdfd, wireframe: false });
  var frontWallCube = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
  frontWallCube.position.z = -10;
  scene.add( frontWallCube );

  // back wall
  var backWallGeometry = new THREE.CubeGeometry(15, 10, 1);
  var backWallMaterial = new THREE.MeshBasicMaterial({ color: 0xfdfdfd, wireframe: false });
  var backWallCube = new THREE.Mesh(backWallGeometry, backWallMaterial);
  backWallCube.position.z = 10;
  scene.add( backWallCube );

  // lighting
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  var spotLight = new THREE.SpotLight( 0xff45f6, 10 );
  spotLight.position.set(0, 5, 0);
  scene.add(spotLight);

  GameLoop();
}

function update()
{
  if( controls.isLocked === true )
  {
    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta;  // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBack );
    direction.x = Number( moveRight ) - Number( moveLeft );
    directions.normalize(); // this ensures consistent movements in all directions

    if( moveForward || moveBack ) velocity.z -= direction.z * 400.0 * delta;
    if( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight( -velocity.x * delta );
    controls.moveForward( -velocity.z * delta );

    prevTime = time;
  }
}

function render()
{
  renderer.render(scene, camera);
}

function GameLoop()
{
  requestAnimationFrame( GameLoop );
  update();
  render();
}
