
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
var symbolBook;
var door;
var lamp;
var lightsOn = [];
var lightPuzzleSolved = false;
var desks;
// variables for objects the user picks up
var pickupable = [];
var doorKey;
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
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);
  var spotLight1 = new THREE.SpotLight( 0xffffff, 100, 10 );
  spotLight1.position.set(0, 3, 0);
  scene.add(spotLight1);
  // var helper = new THREE.PointLightHelper( spotLight1 );
  // scene.add(helper);
  var light1 = new THREE.PointLight( 0xffffff, 4, 10 );
  light1.position.set(4, -2, 18);
  scene.add( light1 );
  var light2 = new THREE.PointLight( 0xffffff, 4, 10 );
  light2.position.set(-0.5, -2, 18);
  scene.add( light2 );
  var light3 = new THREE.PointLight( 0xffffff, 4, 10 );
  light3.position.set(-5, -2, 18);
  scene.add( light3 );
  var light4 = new THREE.PointLight( 0xffffff, 4, 10 );
  light4.position.set(-9.5, -2, 18);
  scene.add( light4 );

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
  desks = new THREE.Object3D();
  desks.deskList = [];
  loader.load('./models/computerdesk/scene.gltf', function(gltf){
    var desk = new THREE.Object3D();
    desk = gltf.scene;
    desk.scale.set(0.02,0.02,0.02);
    for(var i = 0; i < 4; i++)
    {
      var cloneDesk = desk.clone();
      cloneDesk.position.set(4-i*4.5,-4.5,18.8);
      desks.add(cloneDesk);
      desks.deskList.push(cloneDesk);
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

  // symbolBook
  loader.load('./models/book/scene.gltf', function(gltf){
      symbolBook = new THREE.Object3D();
      symbolBook = gltf.scene;
      symbolBook.scale.set(0.5,0.5,0.5);
      symbolBook.position.set(10, -2, 0);
      symbolBook.name = 'symbolBook';
      scene.add(symbolBook);
      interactObjs.push(symbolBook);
  });

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
  doorKey.name = 'doorKey';
	scene.add(doorKey);
  interactObjs.push(doorKey);
  pickupable.push(doorKey);

  // desk lamps and lights
  loader.load('./models/desk_lamp/scene.gltf', function(gltf){
    lamp = new THREE.Object3D();
    lamp = gltf.scene;
    lamp.scale.set(0.5,0.5,0.5);
    var lightColors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00];
    for( var i = 0; i < 4; i++ )
    {
      var lampClone = lamp.clone();
      lampClone.position.set(5-i*4.5,-2,18.8);
      lampClone.name = 'lamp' + (i+1);
      lampClone.turnedOn = false;
      // orient lamp
      var newDir = new THREE.Vector3(1,0,-1);
      var pos = new THREE.Vector3();
      pos.addVectors(newDir, lampClone.position);
      lampClone.lookAt(pos);
      interactObjs.push(lampClone);
      scene.add(lampClone);
      // desks directional lights
      var pl = new THREE.PointLight(lightColors[i], 10, 1, 2);
      pl.intensity = 0;
      pl.position.set(0.5,1,0);
      lampClone.add(pl);
      lampClone.light = pl;
      //var helper = new THREE.PointLightHelper( d1, 1 );
      //scene.add(helper);
    }
  });

  GameLoop();
}

// checks if object is in list
function containsObj( obj, list )
{
  for( var i = 0; i < list.length; i++ )
  {
    if( list[i].name == obj.name )
      return true;
  }
  return false;
}

// finds the senior most parent of the object (ie the whole model rather than its parts)
function getAncestor(obj)
{
  while( !containsObj(obj, interactObjs) )
    obj = obj.parent;
  return obj;
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
      // check if a gltf model was selected
      if(intersects.length > 1)
      {
        var obj = intersects[0].object;
        obj = getAncestor(obj);
        console.log('object selected: ' + obj.name);

        // LAMP PUZZLE interaction for the lamps (turning on and off)
        if( obj.name.startsWith('lamp') )
        {
          // flip the lamp's switch
          obj.turnedOn = !obj.turnedOn;
          console.log('light on: ' + obj.turnedOn );
          if( obj.turnedOn ){
            // add to list of lights turned on
            lightsOn.push(obj);
            // blue light is kinda weak, so it needs more intensity
            if(obj.name == 'lamp3')
              obj.light.intensity = 100;
            else
              obj.light.intensity = 10
          }
          else {
            // check if lights need to be reset
            if( lightsOn.length == 4 )
            {
              // reset the puzzle and turn off lights
              lightsOn.forEach(l => {l.light.intensity = 0;l.turnedOn=false;});
              lightsOn = [];
            }
            else
            {
              // remove from list of lights turned on
              lightsOn = lightsOn.filter(function(l){
                if( l != obj ) return l;
              });
              obj.light.intensity = 0;
            }
          }
          // check if the puzzle has been solved
          if( lightsOn.length == 4 && !lightPuzzleSolved )
          {
            var correctOrder = ['lamp4','lamp2','lamp3','lamp1'];
            var solved = true;
            for( var i = 0; i < 4; i++ )
            {
              if( lightsOn[i].name != correctOrder[i] )
                solved = false;
            }
            if(solved)
            {
              console.log('lights puzzle solved!!');
              lightPuzzleSolved = true;
              // display the number
              var geometry = new THREE.PlaneGeometry(0.5,0.5);
              var texture = new THREE.TextureLoader().load('./models/computerdesk/computerscreen.jpg');
              var material1 = new THREE.MeshBasicMaterial( {map: texture, color:0xffffff} );
              var compScreen = new THREE.Mesh(geometry, material1);
              compScreen.position.set(4.05,-1.45,18.62);
              compScreen.rotateY(Math.PI);
              scene.add(compScreen);
            }
            else
            {
              console.log('incorrect order, click to reset');
            }
          }
        }
      }

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
        //console.log('intersect object position' + intersects[i].object.position);
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
