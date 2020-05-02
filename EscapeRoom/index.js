
var scene, camera, renderer;
var controls;
var raycaster;
var moveForward = false;
var moveBack = false;
var moveRight = false;
var moveLeft = false;
var mouse = new THREE.Vector2();
// interactive objects
var interactObjs = [];
var doorKey, symbolBook;
var door;
// variables for objects the user picks up
var pickupable = [];
var clicked = false;
var pickedUp = false;
var pickedUpObject;
var objOgLocation = new THREE.Vector3();

var winner;

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
  scene.add(camera);

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
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  });

  controls.addEventListener( 'unlock', function(){
    blocker.style.display = 'block';
    instructions.style.display = '';
  });

  scene.add( controls.getObject() );

  // this is for checking what key was clicked
  var onKeyDown = function(event){

    switch( event.keyCode )
    {
      case 38: // up arrow key
		    console.log(camera.position.z);
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
      case 68:  // D key pressed, dropping object
        if(pickedUp)
        {
          // set object to its original location 
          camera.remove(pickedUpObject);
          pickedUpObject.position.set(objOgLocation.x, objOgLocation.y, objOgLocation.z);
          scene.add(pickedUpObject);
          console.log(pickedUpObject.position);
          pickedUp = false;
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

			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	};

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  document.addEventListener( 'click', onclick, false );
  document.addEventListener( 'mousemove', onmousemove, false );

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0,-1,0), 0, 10);

  // create the empty room
  // floor
  var floorGeometry = new THREE.CubeGeometry(30, 1, 40);
  var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x6f3610, wireframe: false });
  var floorCube = new THREE.Mesh(floorGeometry, floorMaterial);
  floorCube.position.y = -5;
  scene.add( floorCube );

  // ceiling
  var ceilingGeometry = new THREE.CubeGeometry(30, 1, 40);
  var ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xdfdfdf, wireframe: false });
  var ceilingCube = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceilingCube.position.y = 5;
  scene.add( ceilingCube );

  // left wall
  var leftWallGeometry = new THREE.CubeGeometry(1, 10, 40);
  var leftWallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });
  var leftWallCube = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
  leftWallCube.position.x = -15;
  scene.add( leftWallCube );

  // right wall
  var rightWallGeometry = new THREE.CubeGeometry(1, 10, 40);
  var rightWallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });
  var rightWallCube = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
  rightWallCube.position.x = 15;
  scene.add( rightWallCube );

  // front wall
  var frontWallGeometry = new THREE.CubeGeometry(30, 10, 1);
  var frontWallMaterial = new THREE.MeshBasicMaterial({ color: 0xfdfdfd, wireframe: false });
  var frontWallCube = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
  frontWallCube.position.z = -20;
  scene.add( frontWallCube );

  // back wall
  var backWallGeometry = new THREE.CubeGeometry(30, 10, 1);
  var backWallMaterial = new THREE.MeshBasicMaterial({ color: 0xfdfdfd, wireframe: false });
  var backWallCube = new THREE.Mesh(backWallGeometry, backWallMaterial);
  backWallCube.position.z = 20;
  scene.add( backWallCube );

  // lighting
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  var spotLight = new THREE.SpotLight( 0xffffff, 10 );
  spotLight.position.set(0, 5, 0);
  scene.add(spotLight);

  // symbols painting
  var loader = new THREE.GLTFLoader();
  loader.load('./models/symbols_painting/scene.gltf', function(gltf){
    var symbolPainting = new THREE.Object3D();
    symbolPainting = gltf.scene;
    symbolPainting.scale.set(0.1,0.1,0.1);
    symbolPainting.position.set(-14.25, 0, 0);
    scene.add(symbolPainting);
  });

  // desks
  var desks = new THREE.Object3D();
  loader.load('./models/computerdesk/scene.gltf', function(gltf){
    var desk = new THREE.Object3D();
    desk = gltf.scene;
    desk.scale.set(0.02,0.02,0.02);
    for(var i = 0; i < 4; i++)
    {
      var cloneDesk = desk.clone();
      cloneDesk.position.set(4-i*4.5,-4.5,18.8);
      desks.add(cloneDesk);
    }
  });
  scene.add(desks);

  // desk chairs
  var chairs = new THREE.Object3D();
  loader.load('./models/deskchair/scene.gltf', function(gltf){
    var chair = new THREE.Object3D();
    chair = gltf.scene;
    chair.scale.set(0.08,0.08,0.08);
    for( var i = 0; i < 4; i++ )
    {
      var cloneChair = chair.clone();
      cloneChair.position.set(4-i*4.5, -1.7, 18);
      // orient chair correctly
      var newDir = new THREE.Vector3(-1,0,0);
      var pos = new THREE.Vector3();
      pos.addVectors(newDir, cloneChair.position);
      cloneChair.lookAt(pos);
      chairs.add(cloneChair);
    }
  });
  scene.add(chairs);

  //door
  var doorGeometry = new THREE.CubeGeometry(3, 7, 1);
  var doorMaterial = new THREE.MeshBasicMaterial({ color: 0xcf824e });
  door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, -1, -19.75);
  scene.add(door);

  // temp key
	var doorKeyGeometry = new THREE.SphereGeometry(0.5, 20, 20);
	var doorKeyMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
	doorKey = new THREE.Mesh(doorKeyGeometry, doorKeyMaterial);
	doorKey.position.set(0, -4, 5);
	scene.add(doorKey);
  interactObjs.push(doorKey);
  pickupable.push(doorKey);

  // symbolBook
  loader.load('./models/book/scene.gltf', function(gltf){
      symbolBook = new THREE.Object3D();
      symbolBook = gltf.scene;
      symbolBook.scale.set(0.5,0.5,0.5);
      symbolBook.position.set(10, -2, 0);
      scene.add(symbolBook);
      interactObjs.push(symbolBook);
  });

  GameLoop();
}

// checks if object is in list
function containsObj( obj, list )
{
  for( var i = 0; i < list.length; i++ )
  {
    if( list[i].position == obj.position )
      return true;
  }
  return false;
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
	var intersects = rayray.intersectObjects(interactObjs, true);
	var interspects = doorIntersector.intersectObject(door);

	if (clicked){
		if (pickedUp){
			if (interspects.length > 0){
				win();
			}
		} else {
      console.log('intersects length: ' + intersects.length);
			for ( var i = 0; i < intersects.length; i++ ) {
        // check if the object in the raycaster is pickupable, and if so pick it up
        // TODO make sure user can't try to pick up something when already holding something
        if( containsObj(intersects[i].object, pickupable) )
        {
          // save the original location of object so user drops in the original place if they want to drop an object
          objOgLocation.x = intersects[i].object.position.x;
          objOgLocation.y = intersects[i].object.position.y;
          objOgLocation.z = intersects[i].object.position.z;
  				// intersects[i].object.position.y = camera.position.y;
          // add to camera to simulate picking up
  				camera.add(intersects[i].object);
  				intersects[i].object.position.set(2,-2,-5);
          pickedUpObject = intersects[i].object;
          pickedUp = true;
        }
        // temp for checking interaction with book
        else( intersects[i].object.position == symbolBook.position )
        {
          console.log("clicked on book");
        }
        console.log('intersect object position' + intersects[i].object.position);
			}

			// if (intersects.length > 0){
			// 	pickedUp = true;
			// }

		}
		clicked = false;
	}

    prevTime = time;
}

function win (){
	console.log("You've escaped");
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
