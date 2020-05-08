
var scene, camera, renderer;
var controls;
var objects = [];
var raycaster;
var moveForward = false;
var moveBack = false;
var moveRight = false;
var moveLeft = false;
var mouse = new THREE.Vector2();
// interactive objects
var interactObjs = [];
var lamp;
var lightsOn = [];
var lightPuzzleSolved = false;
var bookClickedOn = false;
var bookpage;
var desks;
// variables for objects the user picks up
var pickupable = [];
var doorKey;
var clicked = false;
var pickedUp = false;
var pickedUpObject;
var objOgLocation = new THREE.Vector3();
//Shows whether or not the player has won the game
var winner = false;
var winScreen = document.getElementById('win');
//Keeps track of time and physics elements of the game
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();

function init()
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
	if (!bookClickedOn){
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
        else if(bookClickedOn)
        {
          bookClickedOn = false;
          camera.remove(bookpage);
        }
        break;
	  case 82:
		if (winner){
			winner = false;
			blocker.style.display = 'none';
			winScreen.style.display = 'none';
			/*controls.unlock();
			scene.visible = true;*/
			init();
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
			mouse.x = 0.48 * 2 - 1;
			mouse.y = 0.48 * 2 - 1;
		} else {
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			/*console.log(mouse.x);
			console.log(mouse.y);*/
		}

	};

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  document.addEventListener( 'click', onclick, false );
  document.addEventListener( 'mousemove', onmousemove, false );

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0,-1,0), 0, 10);
  var bookshelfT, bookshelfP, bookshelfLB, bookshelfG;
  
  // create the empty room
  //camera target
  var targetGeometry = new THREE.RingGeometry(0.1,0.2,18);
  var targetMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false });
  var target = new THREE.Mesh(targetGeometry, targetMaterial);
  scene.add(target);
  camera.add(target);
  target.position.set(0,0,-5);
  
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
  
  var manager = new THREE.LoadingManager();
  manager.onStart = function ( url) {
	  console.log( 'Started loading file: ' + url);
  };
  
  manager.onLoad = function ( ) {

	console.log( 'Loading complete!');
   };
   
   manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

   };
   
   manager.onError = function ( url, itemsLoaded, itemsTotal ) {

	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

   };
  
  // symbols painting
  var loader = new THREE.GLTFLoader(manager);
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
      cloneChair.rotation.y = -Math.PI/2;
      chairs.add(cloneChair);
    }
  });
  scene.add(chairs);

  // book table
  var bookTable = new THREE.Object3D();
  loader.load('./models/table/scene.gltf', function(gltf){
    bookTable = gltf.scene;
    bookTable.position.set(9,-5,0);
    bookTable.scale.set(3, 3, 3);
    bookTable.rotation.y = Math.PI/2;
    scene.add(bookTable);
  });

  // symbolBook
  loader.load('./models/book/scene.gltf', function(gltf){
      var symbolBook = new THREE.Object3D();
      symbolBook = gltf.scene;
      symbolBook.scale.set(0.3,0.3,0.3);
      symbolBook.position.set(9, -2.5, 0);
      symbolBook.rotation.y = Math.PI/2;
      symbolBook.name = 'symbolBook';
      scene.add(symbolBook);
      interactObjs.push(symbolBook);
      var lightBook = symbolBook.clone();
      lightBook.position.set(9, -2.5, 2);
      lightBook.name = 'lightBook';
      scene.add(lightBook);
      interactObjs.push(lightBook);
  });
  
  loader.load('./models/battery.gltf', function(gltf){
	  var battery = new THREE.Object3D();
	  battery = gltf.scene;
	  battery.scale.set(0.25, 0.25, 0.25);
	  battery.position.set(0, -4, 0);
	  interactObjs.push(battery);
	  pickupable.push(battery);
	  battery.name = 'battery';
	  scene.add(battery);
  });
  
  /*loader.load('./models/bookshelves/bookshelf_red.gltf', function(gltf){
	  var bookshelfR = new THREE.Object3D();
	  bookshelfR = gltf.scene;
	  bookshelfR.postion.set(0, -5, 10);
	  scene.add(bookshelfR);
  });*/
  
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(-13.75, -4.5, 10);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = Math.PI / 2;
	  scene.add(bookshelfB);
  });
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(-13.75, -4.5, -10);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = Math.PI / 2;
	  scene.add(bookshelfB);
  });
  
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(-13.75, -4.5, 7);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = Math.PI / 2;
	  scene.add(bookshelfB);
  });
  
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(-13.75, -4.5, -7);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = Math.PI / 2;
	  scene.add(bookshelfB);
  });
  
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(13.75, -4.5, 10);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = -Math.PI / 2;
	  scene.add(bookshelfB);
  });
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(13.75, -4.5, -10);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = -Math.PI / 2;
	  scene.add(bookshelfB);
  });
  
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(13.75, -4.5, 7);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = -Math.PI / 2;
	  scene.add(bookshelfB);
  });
  
  loader.load('./models/bookshelves/bookshelf_black.gltf', function(gltf){
	  var bookshelfB = new THREE.Object3D();
	  bookshelfB = gltf.scene;
	  bookshelfB.position.set(13.75, -4.5, -7);
	  bookshelfB.scale.set(0.65, 0.65, 0.65);
	  bookshelfB.rotation.y = -Math.PI / 2;
	  scene.add(bookshelfB);
  });
  
  /*loader.load('./models/bookshelves/bookshelf_blue.gltf', function(gltf){
	  bookshelfLB = new THREE.Object3D();
	  bookshelfLB = gltf.scene;
	 // bookshelfLB.postion.set(0, -1, 10);
	  scene.add(bookshelfLB);
  });
  
  loader.load('./models/bookshelves/bookshelf_purple.gltf', function(gltf){
	  bookshelfP = new THREE.Object3D();
	  bookshelfP = gltf.scene;
	//  bookshelfP.postion.set(0, -1, 10);
	  scene.add(bookshelfP);
  });
  
  loader.load('./models/bookshelves/bookshelf_green.gltf', function(gltf){
	  bookshelfG = new THREE.Object3D();
	  bookshelfG = gltf.scene;
	 // bookshelfG.postion.set(0, -1, 10);
	  scene.add(bookshelfG);
  });
  
  loader.load('./models/bookshelves/bookshelf_turquiouse.gltf', function(gltf){
	  bookshelfT = new THREE.Object3D();
	  bookshelfT = gltf.scene;
	//  bookshelfT.postion.set(0, -1, 10);
	  scene.add(bookshelfT);
  });*/
  
  loader.load("models/door.gltf", function(gltf){
	  var niceDoor = new THREE.Object3D();
	  niceDoor = gltf.scene;
	  niceDoor.position.set(0, -3.25, -19.25);
	  niceDoor.scale.set(0.8, 0.8, 0.8);
	  niceDoor.name = 'door';
	  interactObjs.push(niceDoor);
	  scene.add(niceDoor);
  });
  
  //key
  loader.load('./models/low-poly-key.gltf', function(gltf){
	  var niceKey = new THREE.Object3D();
	  niceKey = gltf.scene;
	  niceKey.scale.set(0.002, 0.002, 0.002);
	  niceKey.position.set(0, -4, 10);
	  scene.add(niceKey);
	  niceKey.name = 'niceKey';
	  interactObjs.push(niceKey);
	  pickupable.push(niceKey);
  });
  
  //map
  loader.load('./models/puzzle_map/puzzle-map.gltf', function(gltf){
	  var map = new THREE.Object3D();
	  map = gltf.scene;
	  map.position.set(8, 0, -19.25);
	  map.rotation.y = Math.PI / 2;
	  map.rotation.z = Math.PI / 2;
	  interactObjs.push(map);
	  map.name = 'map';
	  scene.add(map);
  });
  
  //plaque
  loader.load('./models/plaque.gltf', function(gltf){
	  var plaque = new THREE.Object3D();
	  plaque = gltf.scene;
	  plaque.scale.set(0.5, 0.5, 0.5);
	  plaque.position.set(5, 0, -19.25);
	  plaque.rotation.y = -Math.PI / 2;
	  interactObjs.push(plaque);
	  plaque.name = 'plaque';
	  scene.add(plaque);
  });
  
  //alarm
  loader.load('./models/digital-clock.gltf', function(gltf){
	  var clock = new THREE.Object3D();
	  clock = gltf.scene;
	  scene.add(clock);
  });

  // temp key
	var doorKeyGeometry = new THREE.SphereGeometry(0.5, 20, 20);
	var doorKeyMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
	doorKey = new THREE.Mesh(doorKeyGeometry, doorKeyMaterial);
	doorKey.position.set(0, -4, 5);
	scene.add(doorKey);
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


  // initial display is only the instructions
	winScreen.style.display = 'none';
	scene.visible = false;

  GameLoop();
}

window.onload = init;

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
	rayray.setFromCamera( mouse, camera );
	var intersects = rayray.intersectObjects(interactObjs, true);

	if (clicked){
		if (pickedUp){
			if (intersects.length > 1) {
				var obj = intersects[0].object;
				obj = getAncestor(obj);
				if (obj.name.startsWith('door')){
					win();
				}
			}
		} else if(!bookClickedOn) {
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
        else if( obj.name.endsWith('Book') )
        {
          if(!bookClickedOn)
          {
            bookClickedOn = true;
            var material = new THREE.SpriteMaterial( { map: new THREE.TextureLoader().load( "images/" + obj.name+".jpeg" ), color: 0xffffff } );
            bookpage = new THREE.Sprite( material );
            camera.add( bookpage );
            bookpage.position.set(0,0,-1);
            console.log('clicked on book');
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
