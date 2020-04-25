
var scene, camera, renderer;
var controls;
var objects = [];
var raycaster;
var moveForward = false;
var moveBack = false;
var moveRight = false;
var moveLeft = false;
var mouse = new THREE.Vector2();
var doorKey;
var door;
var clicked = false;
var pickedUp = false;

var winner = false;
var winScreen = document.getElementById('win');

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();

window.onload = function init()
{
  // setting the scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);

  //Changed initial position of player
  camera.lookAt( new THREE.Vector3(0,0,-10) );
  camera.position.z = 3;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //rayray.far = 3.0f;

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

  var blocker = document.getElementById('blocker');
  var instructions = document.getElementById('instructions');

  instructions.addEventListener( 'click', function(){
    controls.lock();
  }, false);

  controls.addEventListener( 'lock', function(){
    if (!winner){
		instructions.style.display = 'none';
		blocker.style.display = 'none';
		winScreen.style.display = 'none';
		scene.visible = true;
	}
  });

  controls.addEventListener( 'unlock', function(){
	if (!winner){
		blocker.style.display = 'block';
		instructions.style.display = '';
		winScreen.style.display = 'none';
		scene.visible = false;
	}
  });

  scene.add( controls.getObject() );

  // this is for checking what key was clicked
  var onKeyDown = function(event){

    switch( event.keyCode )
    {
      case 38: // up arrow key
	  case 87: // W key
        moveForward = true;
        break;
      case 37:  // left arrow key
	  case 65:  // A key
        moveLeft = true;
        break;
      case 40:  // down arrow key
	  case 83:  // S key
        moveBack = true;
        break;
      case 39:  // right arrow key
	  case 68:  // D key
        moveRight = true;
        break;
    }
  };

  // after the key is released
  var onKeyUp = function(event){

    switch( event.keyCode )
    {
      case 38: // up arrow key
	  case 87: // W key
        moveForward = false;
        break;
      case 37:  // left arrow key
	  case 65:  // A key
        moveLeft = false;
        break;
      case 40:  // down arrow key
	  case 83:  // S key
        moveBack = false;
        break;
      case 39:  // right arrow key
	  case 68:  // D key
        moveRight = false;
        break;
	  case 82:
		if (winner){
			winner = false;
			blocker.style.display = 'none';
			winScreen.style.display = 'none';
			controls.lock();
			scene.visible = true;
		}
		break;
    }
  };

  var onclick = function(event) {
		if (document.pointerLockElement != null){
			clicked = true;
		}
  };

  var onmousemove = function (event) {
		if (document.pointerLockElement != null){
			mouse.x = window.innerWidth / 2;
			mouse.y = window.innerHeight / 2;
		} else {
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}

	};

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  document.addEventListener( 'click', onclick, false );
  document.addEventListener( 'mousemove', onmousemove, false );

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

  //door
  var doorGeometry = new THREE.CubeGeometry(3, 7, 1);
  var doorMaterial = new THREE.MeshBasicMaterial({ color: 0xcf824e });
  door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, -1, -9.75);
  scene.add(door);

  // temp key
	var doorKeyGeometry = new THREE.SphereGeometry(0.5, 20, 20);
	var doorKeyMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
	doorKey = new THREE.Mesh(doorKeyGeometry, doorKeyMaterial);
	doorKey.position.set(0, -4, 5);
	scene.add(doorKey);

  // initial display is only the instructions
	winScreen.style.display = 'none';
	scene.visible = false;

  GameLoop();
}

function update()
{
	var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta;  // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBack );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    if( moveForward || moveBack ) velocity.z -= direction.z * 400.0 * delta;
    if( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight( -velocity.x * delta );
    controls.moveForward( -velocity.z * delta );

	var rayray  = new THREE.Raycaster();
	var doorIntersector = new THREE.Raycaster();
	rayray.setFromCamera( mouse, camera );
	doorIntersector.setFromCamera( mouse, camera );
	var intersects = rayray.intersectObject(doorKey);
	var interspects = doorIntersector.intersectObject(door);

	if (clicked){
		if (pickedUp){
			if (interspects.length > 0){
				win();
			}
		} else {
			for ( var i = 0; i < intersects.length; i++ ) {
				intersects[i].object.position.y = camera.position.y;
				camera.add(intersects[i].object);
				intersects[i].object.position.set(2,-2,-5);
			}

			if (intersects.length > 0){
				pickedUp = true;
			}

		}
		clicked = false;
	}

    prevTime = time;
}

function win (){
	winner = true;
	blocker.style.display = 'block';
    winScreen.style.display = '';
	controls.unlock();
	scene.visible = false;
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
