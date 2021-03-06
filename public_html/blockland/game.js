
class Game {
	constructor() {
		if (!Detector.webgl) Detector.addGetWebGLMessage();



		this.modes = Object.freeze({
			NONE: Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING: Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAMEOVER: Symbol("gameover")
		});
		this.mode = this.modes.NONE;


		this.container;
		this.player;
		this.cameras;
		this.camera;
		this.scene;
		this.renderer;
		this.animations = {};
		this.assetsPath = 'assets/';

		this.colliders = [];
		this.remotePlayers = [];
		this.remoteColliders = [];
		this.initialisingPlayers = [];
		this.remoteData = [];

		this.messages = {
			text: [
				"Welcome to Blockland",
				"GOOD LUCK!"
			],
			index: 0
		}

		this.container = document.createElement('div');
		this.container.style.height = '100%';
		document.body.appendChild(this.container);

		const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';

		const game = this;

		this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];

		const options = {
			assets: [
				`${this.assetsPath}images/KakaoTalk_20210916_195442737.png`,
				`${this.assetsPath}images/KakaoTalk_20210916_195442737.png`,
				`${this.assetsPath}images/KakaoTalk_20210916_195442737.png`,
				`${this.assetsPath}images/KakaoTalk_20210916_195442737.png`,
				`${this.assetsPath}images/KakaoTalk_20210916_195442737.png`,
				`${this.assetsPath}images/KakaoTalk_20210916_195442737.png`
			],
			oncomplete: function () {
				game.init();
			}
		}

		this.anims.forEach(function (anim) { options.assets.push(`${game.assetsPath}fbx/anims/${anim}.fbx`) });
		// options.assets.push(`${game.assetsPath}fbx/town.fbx`);

		this.mode = this.modes.PRELOAD;

		this.clock = new THREE.Clock();

		const preloader = new Preloader(options);

		window.onError = function (error) {
			console.error(JSON.stringify(error));
		}
	}

	initSfx() {
		this.sfx = {};
		this.sfx.context = new (window.AudioContext || window.webkitAudioContext)();
		this.sfx.gliss = new SFX({
			context: this.sfx.context,
			src: { mp3: `${this.assetsPath}sfx/gliss.mp3`, ogg: `${this.assetsPath}sfx/gliss.ogg` },
			loop: false,
			volume: 0.3
		});
	}

	set activeCamera(object) {
		this.cameras.active = object;
	}


	init() {
		this.mode = this.modes.INITIALISING;

		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x00a0f0);

		const ambient = new THREE.AmbientLight(0xaaaaaa);
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight(0xaaaaaa);
		light.position.set(30, 100, 40);
		light.target.position.set(0, 0, 0);

		light.castShadow = true;

		const lightSize = 500;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 500;
		light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

		light.shadow.bias = 0.0039;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;

		this.sun = light;
		this.scene.add(light);

		// ?????????1
		const fontLoader = new THREE.FontLoader();
		fontLoader.load("/libs/three.js-master/examples/fonts/helvetiker_regular.typeface.json", function (font) {
			const fgeometry = new THREE.TextGeometry('Stage', {
				font: font,
				size: 500, // ????????? ??????
				height: 20, // ?????? ??????
				curveSegments: 12, // ????????? ??? : ????????? 12
				bevelEnabled: true, // ????????? on
				bevelThickness: 10, // ????????? ??????? : ????????? 10
				bevelSize: 8, //????????? ????????? : ????????? 8
				bevelOffset: 0, // ????????? ???????????? ?????? ?????? ?????? : ????????? 0
				bevelSegments: 5
			});
			const textMesh = new THREE.Mesh(fgeometry, [
				new THREE.MeshPhongMaterial({ color: 0xad4000 }), // front
				new THREE.MeshPhongMaterial({ color: 0x5c2301 })	 // side
			])
			textMesh.castShadow = true
			textMesh.position.set(-1000, 800, -1500) // ????????? ??????
			game.scene.add(textMesh)
		});

		// ?????????2
		fontLoader.load("/libs/three.js-master/examples/fonts/helvetiker_regular.typeface.json", function (font) {
			const fgeometry = new THREE.TextGeometry('BIT ', {
				font: font,
				size: 500, // ????????? ??????
				height: 20, // ?????? ??????
				curveSegments: 12, // ????????? ??? : ????????? 12
				bevelEnabled: true, // ????????? on
				bevelThickness: 10, // ????????? ??????? : ????????? 10
				bevelSize: 8, //????????? ????????? : ????????? 8
				bevelOffset: 0, // ????????? ???????????? ?????? ?????? ?????? : ????????? 0
				bevelSegments: 5
			});
			const textMesh = new THREE.Mesh(fgeometry, [
				new THREE.MeshPhongMaterial({ color: 0xad4000 }), // front
				new THREE.MeshPhongMaterial({ color: 0x5c2301 })	 // side
			])
			textMesh.castShadow = true
			textMesh.position.set(-1000, 80, -6000) // ????????? ??????
			game.scene.add(textMesh)
		});
		
		const startButton = document.getElementById('startButton'); //id?????? startButton ??? ???
		startButton.addEventListener('click', this.init); //????????? ???????????? ????????????

		// const overlay = document.getElementById( 'overlay' );
		// overlay.remove();

		// ?????????1
		const listener = new THREE.AudioListener();
		this.camera.add(listener);

		// create a global audio source
		const sound = new THREE.Audio(listener);

		// load a sound and set it as the Audio object's buffer
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load('assets/sound/bensound-ukulele.mp3', function (buffer) {
			sound.setBuffer(buffer);
			sound.setLoop(true);
			sound.setVolume(0.5);
			sound.play();
		});

		// ground
		const tLoader = new THREE.TextureLoader();
		const groundTexture = tLoader.load(`${this.assetsPath}images/KakaoTalk_20210916_161725622.jpg`);
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.repeat.set(8, 8);
		groundTexture.encoding = THREE.sRGBEncoding;

		const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });

		var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
		mesh.rotation.x = - Math.PI / 2;
		mesh.receiveShadow = true;
		this.scene.add(mesh);

		// ?????????
		// const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		// mesh.rotation.x = - Math.PI / 2;
		// //mesh.position.y = -100;
		// mesh.receiveShadow = true;
		// this.scene.add( mesh );

		const grid = new THREE.GridHelper(5000, 40, 0x000000, 0x000000);
		//grid.position.y = -100;
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.scene.add(grid);

		const loader = new THREE.FBXLoader();
		const MLoader = new THREE.MaterialLoader();

		//stage
		const geometry = new THREE.BoxGeometry(11000, 100, 3000); // 5000,x,x
		const material = new THREE.MeshBasicMaterial({ color: 'black', wireframe: false });
		const stage = new THREE.Mesh(geometry, material); 																//???????????? ????????? ??????????????????
		stage.position.set(0, 100, 2950);
		this.colliders.push(stage);
		this.scene.add(stage);

		// //TV
		// loader.load(`${this.assetsPath}fbx/TV.fbx`, function (samsungTV) {
		// 	samsungTV.position.set(0, 500, 2000);  
		// 	samsungTV.scale.set(3, 3, 3);
		// 	samsungTV.rotation.y = Math.PI  ;

		// 	tLoader.load(`${game.assetsPath}images/MainOffice_tx/PolygonOffice_Texture_01_B.png`, function (samsungTV_tx) {
		// 		samsungTV.traverse(function (child) {
		// 			if (child.isMesh) {
		// 				child.material.map = samsungTV_tx;
		// 				game.colliders.push(child);
		// 			}
		// 		});							
		// 	game.scene.add(samsungTV);		
		// 	});

		// });



		//????????? ??????
		const geomscreenout = new THREE.BoxGeometry(11000, 4400, 80); // 5000,3000,80
		const materscreenout = new THREE.MeshBasicMaterial({ color: 'gray', wireframe: false });
		const screenout = new THREE.Mesh(geomscreenout, materscreenout);
		screenout.position.set(0, 2300, 4000);
		this.colliders.push(screenout);
		this.scene.add(screenout);

		//????????? ???
		const geomscreenin = new THREE.BoxGeometry(10500, 3800, 100);  // 2500
		const materscreenin = new THREE.MeshBasicMaterial({ color: 'white', wireframe: false });
		const screenin = new THREE.Mesh(geomscreenin, materscreenin);
		screenin.position.set(0, 2150, 4000);
		this.colliders.push(screenin);
		this.scene.add(screenin);

		// ??????
		//const loader = new THREE.FBXLoader();
		loader.load(`${this.assetsPath}fbx/SM_Buildings_Stairs_1x2_01P.fbx`, function (Stair) {
			Stair.position.set(-300, 0, 1500);
			Stair.scale.set(5, 3, 3);
			Stair.rotation.y = Math.PI / 1;

			tLoader.load(`${game.assetsPath}images/PolygonPrototype_Texture_04.png`, function (Stairtext) {
				Stair.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = Stairtext;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(Stair);
		});

		//???
		loader.load(`${this.assetsPath}fbx/SM_Veh_Car_Sports_01.fbx`, function (Car) {
			Car.position.set(-3900, 150, 3000);
			Car.scale.set(3, 3, 3);
			Car.rotation.y = Math.PI / 1.4;

			tLoader.load(`${game.assetsPath}images/PolygonPrototype_Texture_04.png`, function (Cartext) {
				Car.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = Cartext;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(Car);
		});

		//kmh
		// loader.load(`${this.assetsPath}fbx/Iron_Man_Mark_44_Hulkbuster_fbx.FBX`, function (kmh) {
		// 	kmh.position.set(-3900, 150, 3000);
		// 	kmh.scale.set(100, 100, 100);
		// 	kmh.rotation.y = Math.PI / 1.4;

		// 	tLoader.load(`${game.assetsPath}images/1.png`, function (kmhclothes) {
		// 		kmh.traverse(function (child) {
		// 			if (child.isMesh) {
		// 				child.material.map = kmhclothes;
		// 				game.colliders.push(child);
		// 			}
		// 		});
		// 	});
		// 	game.scene.add(kmh);
		// });

		//????????????
		loader.load(`${this.assetsPath}fbx/CB_Discobolus_LOD0.fbx`, function (balloons) {
			balloons.position.set(6000, 0, 3300);
			balloons.scale.set(6, 6, 6);
			balloons.rotation.y = Math.PI / 1.5;

			tLoader.load(`${game.assetsPath}images/Road_divider.png`, function (balloonstext) {
				balloons.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = balloonstext;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(balloons);
		});

		//?????????1 ???

		loader.load(`${this.assetsPath}fbx/SM_Icon_Cup_01.fbx`, function (Cup1) {
			Cup1.position.set(-3600, 150, 2100);
			Cup1.scale.set(3, 3, 3);
			Cup1.rotation.y = Math.PI / 1.4;

			tLoader.load(`${game.assetsPath}images/PolygonPrototype_Texture_01.png`, function (Cup1text) {
				Cup1.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = Cup1text;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(Cup1);
		});

		//?????????2 ???
		loader.load(`${this.assetsPath}fbx/SM_Icon_Cup_02.fbx`, function (Cup2) {
			Cup2.position.set(-3500, 150, 2100);
			Cup2.scale.set(1.7, 1.7, 1.7);
			Cup2.rotation.y = Math.PI / 1.4;

			tLoader.load(`${game.assetsPath}images/PolygonPrototype_Texture_01.png`, function (Cup2text) {
				Cup2.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = Cup2text;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(Cup2);

		});

		//?????????3 ???
		loader.load(`${this.assetsPath}fbx/SM_Icon_Cup_03.fbx`, function (Cup3) {
			Cup3.position.set(-3700, 150, 2100);
			Cup3.scale.set(1.7, 1.7, 1.7);
			Cup3.rotation.y = Math.PI / 1.4;

			tLoader.load(`${game.assetsPath}images/PolygonPrototype_Texture_01.png`, function (Cup3text) {
				Cup3.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = Cup3text;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(Cup3);

		});

		//garden1====== ==================================================================================
		loader.load(`${this.assetsPath}fbx/garden1.fbx`, function (garden1) {
			garden1.position.set(-500, 500, -3000);
			garden1.scale.set(3, 3, 3);
			garden1.rotation.y = Math.PI;

			tLoader.load(`${game.assetsPath}images/MainOffice_tx/PolygonOffice_Texture_01_A.png`, function (garden1_tx) {
				garden1.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = garden1_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(garden1);
			});
		});

		//polygonoffice3====== ==================================================================================
		//?????????1(?????????)
		loader.load(`${this.assetsPath}fbx/polygonoffice3.fbx`, function (polygonoffice3) {
			polygonoffice3.position.set(-1000, 300, -7500);
			polygonoffice3.scale.set(2, 2, 2);
			//polygonoffice3.rotation.y = Math.PI  ;

			tLoader.load(`${game.assetsPath}images/PolygonOffice_Texture_01_A.png`, function (polygonoffice3_tx) {
				polygonoffice3.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = polygonoffice3_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(polygonoffice3);
			});

		});
		//?????????2(??????)
		loader.load(`${this.assetsPath}fbx/polygonkitchen7.fbx`, function (polygonkitchen) {
			polygonkitchen.position.set(-5000, -80, -5500);
			polygonkitchen.scale.set(2, 2, 2);
			polygonkitchen.rotation.y = Math.PI / 6;

			tLoader.load(`${game.assetsPath}images/PolygonOffice_Texture_01_A.png`, function (polygonkitchen_tx) {
				polygonkitchen.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = polygonkitchen_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(polygonkitchen);
			});

		});


		//smalloffice1(?????????) ==================================================================================
		loader.load(`${this.assetsPath}fbx/smalloffice1.fbx`, function (smalloffice1) {
			smalloffice1.position.set(7500, 380, 2000);  //(4800, 480, -9000)
			smalloffice1.scale.set(1.5, 1.5, 1.5);
			smalloffice1.rotation.y = Math.PI;

			tLoader.load(`${game.assetsPath}images/SimpleOffice_Texture.png`, function (smalloffice1_tx) {
				smalloffice1.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = smalloffice1_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(smalloffice1);
			});
		});
		//simpleoffice2(??????)
		loader.load(`${this.assetsPath}fbx/simpleoffice2.fbx`, function (simpleoffice2) {
			simpleoffice2.position.set(5500, 900, -7000);
			simpleoffice2.scale.set(1.3, 1.3, 1.3);
			simpleoffice2.rotation.y = Math.PI;

			tLoader.load(`${game.assetsPath}images/SimpleOffice_Texture.png`, function (simpleoffice2_tx) {
				simpleoffice2.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = simpleoffice2_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(simpleoffice2);
			});
		});
		//LPMoffice ========================================================================================
		//walls_doors3 
		loader.load(`${this.assetsPath}fbx/walls_doors3.fbx`, function (walls_doors3) {
			walls_doors3.position.set(7000, 450, -2500);
			walls_doors3.scale.set(2, 2, 2);
			walls_doors3.rotation.y = Math.PI;

			tLoader.load(`${game.assetsPath}images/colorpalette.png`, function (walls_doors3_tx) {
				walls_doors3.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = walls_doors3_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(walls_doors3);
				// MLoader.load('material/glass.mat',function(material){
				// 	game.scene.add(material.scene)
				// });	
			});

		});

		//floor
		loader.load(`${this.assetsPath}fbx/floor.fbx`, function (floor) {
			floor.position.set(6500, 1000, -1000);
			floor.scale.set(2, 2, 2);
			floor.rotation.y = Math.PI;

			tLoader.load(`${game.assetsPath}images/colorpalette.png`, function (floor_tx) {
				floor.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = floor_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(floor);
			});
		});

		//enterance1
		loader.load(`${this.assetsPath}fbx/enterance1.fbx`, function (enterance1) {
			enterance1.position.set(4900, 450, -100);//2600, 1000, -3100)
			enterance1.scale.set(2, 2, 2);
			enterance1.rotation.y = Math.PI;

			tLoader.load(`${game.assetsPath}images/colorpalette.png`, function (enterance1_tx) {
				enterance1.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = enterance1_tx;
						game.colliders.push(child);
					}
				});
				game.scene.add(enterance1);
			});
		});

		//structure(??????)====================================================================================
		loader.load(`${this.assetsPath}fbx/Structure.fbx`, function (structure) {
			structure.position.set(-400, 0, -400);
			structure.scale.set(1.5, 1.5, 1.5);  // ?????? ?????????2??????
			structure.rotation.y = Math.PI / 12;  // ?????????????????? structure??? ???????????? ???

			tLoader.load(`${game.assetsPath}images/KakaoTalk_20210916_161329272.jpg`, function (structure_tx) {
				structure.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = structure_tx;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(structure);
		});

		// stairs
		loader.load(`${this.assetsPath}fbx/Stairs.fbx`, function (stairs) {
			stairs.position.set(-500, 250, -420);
			stairs.scale.set(1.5, 1.5, 1.5);
			stairs.rotation.y = Math.PI / 12;  // ????????? ????????? y??? ?????? ?????????????????? ????????????

			tLoader.load(`${game.assetsPath}images/KakaoTalk_20210916_161329272.jpg`, function (stairs_tx) {
				stairs.traverse(function (child) {
					if (child.isMesh) {
						child.material.map = stairs_tx;
						game.colliders.push(child);
					}
				});
			});
			game.scene.add(stairs);
		});

		// model
		const game = this;

		this.player = new PlayerLocal(this);//??????????????? ?????????????????????????????? ????????? ??????????????? ????????? ??????

		
		
		this.loadEnvironment(loader);

		this.speechBubble = new SpeechBubble(this, "", 150);
		this.speechBubble.mesh.position.set(0, 350, 0);




		this.joystick = new JoyStick({
			onMove: this.playerControl,
			game: this
		});

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);

		

		if ('ontouchstart' in window) {
			window.addEventListener('touchdown', (event) => game.onMouseDown(event), false);
		} else {
			window.addEventListener('mousedown', (event) => game.onMouseDown(event), false);
		}

		window.addEventListener('resize', () => game.onWindowResize(), false);
	}

	// mouseControls(){
	// 	const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
	// 	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	// 	controls.dampingFactor = 0.05;

	// 	controls.screenSpacePanning = false;

	// 	controls.minDistance = 100;
	// 	controls.maxDistance = 500;

	// 	controls.maxPolarAngle = Math.PI / 2;
	// }

	loadEnvironment(loader) {
		const game = this;
		// loader.load(`${this.assetsPath}fbx/town.fbx`, function(object){
		// 	game.environment = object;
		// 	game.colliders = [];
		// 	game.scene.add(object);
		// 	object.traverse( function ( child ) {
		// 		if ( child.isMesh ) {
		// 			if (child.name.startsWith("proxy")){
		// 				game.colliders.push(child);
		// 				child.material.visible = false;
		// 			}else{
		// 				child.castShadow = true;
		// 				child.receiveShadow = true;
		// 			}
		// 		}
		// 	} );

		// const tLoader = new THREE.TextureLoader();
		// const backgroundtexture =tLoader.load( `${game.assetsPath}/images/pngegg.png` );
		// backgroundtexture.repeat.set(35,35);
		// game.scene.background = backgroundtexture;

		// game.loadNextAnim(loader);

		const tloader = new THREE.CubeTextureLoader();
		tloader.setPath(`${game.assetsPath}/images/`);

		var textureCube = tloader.load([
			'KakaoTalk_20210916_195442737.png', 'KakaoTalk_20210916_195442737.png',
			'KakaoTalk_20210916_195442737.png', 'KakaoTalk_20210916_195442737.png',
			'KakaoTalk_20210916_195442737.png', 'KakaoTalk_20210916_195442737.png'
		]);

		game.scene.background = textureCube;

		game.loadNextAnim(loader);


	}

	loadNextAnim(loader) {
		let anim = this.anims.pop();
		const game = this;
		loader.load(`${this.assetsPath}fbx/anims/${anim}.fbx`, function (object) {
			game.player.animations[anim] = object.animations[0];
			if (game.anims.length > 0) {
				game.loadNextAnim(loader);
			} else {
				delete game.anims;
				game.action = "Idle";
				game.mode = game.modes.ACTIVE;
				game.animate();

			}
		});
	}

	playerControl(forward, turn) {
		turn = -turn;

		if (forward > 0.3) {
			if (this.player.action != 'Walking' && this.player.action != 'Running') this.player.action = 'Walking';
		} else if (forward < -0.3) {
			if (this.player.action != 'Walking Backwards') this.player.action = 'Walking Backwards';
		} else {
			forward = 0;
			if (Math.abs(turn) > 0.1) {
				if (this.player.action != 'Turn') this.player.action = 'Turn';
			} else if (this.player.action != "Idle") {
				this.player.action = 'Idle';
			}
		}

		if (forward == 0 && turn == 0) {
			delete this.player.motion;
		} else {
			this.player.motion = { forward, turn };
		}

		this.player.updateSocket();
	}

	createCameras() {
		const offset = new THREE.Vector3(60, 50, 1000);
		const front = new THREE.Object3D();
		front.position.set(100, 100, 2000);
		front.parent = this.player.object;
		const back = new THREE.Object3D();
		back.position.set(200, 300, -1050);
		back.parent = this.player.object;
		const chat = new THREE.Object3D();
		chat.position.set(0, 200, -450);
		chat.parent = this.player.object;
		const wide = new THREE.Object3D();
		wide.position.set(178, 139, 1665);
		wide.parent = this.player.object;
		const overhead = new THREE.Object3D();
		overhead.position.set(0, 400, 0);
		overhead.parent = this.player.object;
		const collect = new THREE.Object3D();
		collect.position.set(40, 82, 94);
		collect.parent = this.player.object;
		this.cameras = { front, back, wide, overhead, collect, chat };
		this.activeCamera = this.cameras.back;

	}

	showMessage(msg, fontSize = 20, onOK = null) {
		const txt = document.getElementById('message_text');
		txt.innerHTML = msg;
		txt.style.fontSize = fontSize + 'px';
		const btn = document.getElementById('message_ok');
		const panel = document.getElementById('message');
		const game = this;
		if (onOK != null) {
			btn.onclick = function () {
				panel.style.display = 'none';
				onOK.call(game);
			}
		} else {
			btn.onclick = function () {
				panel.style.display = 'none';
			}
		}
		panel.style.display = 'flex';
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);

	}

	updateRemotePlayers(dt) {
		if (this.remoteData === undefined || this.remoteData.length == 0 || this.player === undefined || this.player.id === undefined) return;

		const newPlayers = [];
		const game = this;
		//Get all remotePlayers from remoteData array
		const remotePlayers = [];
		const remoteColliders = [];

		this.remoteData.forEach(function (data) {//????????????????????? foreach??? ????????? // ????????? ???????????? function(data) <- data??? ??????
			if (game.player.id != data.id) {
				//Is this player being initialised?
				let iplayer;
				game.initialisingPlayers.forEach(function (player) {
					if (player.id == data.id) iplayer = player;
				});
				//If not being initialised check the remotePlayers array
				if (iplayer === undefined) {
					let rplayer;
					game.remotePlayers.forEach(function (player) {
						if (player.id == data.id) rplayer = player;
					});
					if (rplayer === undefined) {
						//Initialise player
						game.initialisingPlayers.push(new Player(game, data));//????????? ???????????? ???????????? ?????? ????????? ????????? ????????? ????????????????????? ????????? ???????????? ??????
					} else {
						//Player exists
						remotePlayers.push(rplayer);//?????????????????????????????? ??????
						remoteColliders.push(rplayer.collider);
					}
				}
			}
		});

		this.scene.children.forEach(function (object) {
			if (object.userData.remotePlayer && game.getRemotePlayerById(object.userData.id) == undefined) {//????????????????????? ???????????? ????????????
				game.scene.remove(object);//???????????? ??????
			}
		});

		this.remotePlayers = remotePlayers;//?????????????????? ????????? ?????? ??????
		this.remoteColliders = remoteColliders;
		this.remotePlayers.forEach(function (player) { player.update(dt); });
	}

	onMouseDown(event) {
		if (this.remoteColliders === undefined || this.remoteColliders.length == 0 || this.speechBubble === undefined || this.speechBubble.mesh === undefined) return;

		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);//?????? ????????? ?????????????????? ???????????? ??????

		const intersects = raycaster.intersectObjects(this.remoteColliders);
		const chat = document.getElementById('chat');

		if (intersects.length > 0) {
			const object = intersects[0].object;
			const players = this.remotePlayers.filter(function (player) {//filter???????????? ?????? ????????? ????????? ????????? ?????????
				if (player.collider !== undefined && player.collider == object) {
					return true;
				}
			});
			if (players.length > 0) {//???????????? ????????? ???????????? ?????? ??????
				const player = players[0];//?????? ??????????????? ????????? ???????????????
				console.log(`onMouseDown: player ${player.id}`);
				this.speechBubble.player = player;
				this.speechBubble.update('');
				this.scene.add(this.speechBubble.mesh);//??????????????? ??????
				this.chatSocketId = player.id;
				chat.style.bottom = '0px';
				this.activeCamera = this.cameras.chat;
			}
		} else {
			//Is the chat panel visible?
			if (chat.style.bottom == '0px' && (window.innerHeight - event.clientY) > 40) {
				console.log("onMouseDown: No player found");
				if (this.speechBubble.mesh.parent !== null) this.speechBubble.mesh.parent.remove(this.speechBubble.mesh);
				delete this.speechBubble.player;
				delete this.chatSocketId;
				chat.style.bottom = '-50px';//????????? ??????????????? ??????
				this.activeCamera = this.cameras.back;//?????????????????? ??????????????? ??????
			} else {
				console.log("onMouseDown: typing");
			}
		}
	}

	getRemotePlayerById(id) {
		if (this.remotePlayers === undefined || this.remotePlayers.length == 0) return;

		const players = this.remotePlayers.filter(function (player) {
			if (player.id == id) return true;
		});

		if (players.length == 0) return;

		return players[0];
	}

	animate() {
		const game = this;
		const dt = this.clock.getDelta();
		requestAnimationFrame(function () { game.animate(); });

		this.updateRemotePlayers(dt);//?????? ?????? ???????????? ?????? ?????? ??? ????????? ?????? ?????? ?????? ???????????? ???????????? ???????????? ????????? ???????????? ?????????.

		if (this.player.mixer != undefined && this.mode == this.modes.ACTIVE) this.player.mixer.update(dt);

		if (this.player.action == 'Walking') {
			const elapsedTime = Date.now() - this.player.actionTime;
			if (elapsedTime > 1000 && this.player.motion.forward > 0) {
				this.player.action = 'Running';
			}
		}

		if (this.player.motion !== undefined) this.player.move(dt);

		if (this.cameras != undefined && this.cameras.active != undefined && this.player !== undefined && this.player.object !== undefined) {
			this.camera.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.15);
			const pos = this.player.object.position.clone();
			if (this.cameras.active == this.cameras.chat) {
				pos.y += 200;
			} else {
				pos.y += 300;
			}
			this.camera.lookAt(pos);
		}

		if (this.sun !== undefined) {
			this.sun.position.copy(this.camera.position);
			this.sun.position.y += 10;
		}

		if (this.speechBubble !== undefined) this.speechBubble.show(this.camera.position);

		this.renderer.render(this.scene, this.camera);
	}

}
