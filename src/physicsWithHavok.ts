import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "./createScene";
import { havokModule } from "./externals/havok";
import { PhysicsShapeBox, PhysicsShapeSphere } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Color3, CreateBox, DistanceConstraint, PhysicsAggregate, PhysicsRaycastResult, PhysicsViewer, PointerDragBehavior, Ray, RayHelper, SixDofDragBehavior, StandardMaterial } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
class PhysicsSceneWithAmmo implements CreateSceneClass {
    preTasks = [havokModule];
 
    createScene = async (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        
        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera("my first camera", 0, Math.PI / 3, 10, new Vector3(0, 0, 0), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape.
       // const sphere = CreateSphere("sphere", { diameter: 2, segments: 24 }, scene);

        // Move the sphere upward at 4 units
       // sphere.position.y = 4;
        
        // Our built-in 'ground' shape.
        const ground = CreateGround("ground", { width: 10, height: 10 }, scene);
        
        // PHYSICS!
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));

        //var physicsViewer = new PhysicsViewer();

        /* Create a sphere shape
        const sphereShape = new PhysicsShapeSphere(new Vector3(0, 0, 0)
            , 1
            , scene);

            
        // Set shape material properties
        sphereShape.material = { friction: 0.2, restitution: 0.6 };

        // Sphere body
        const sphereBody = new PhysicsBody(sphere, PhysicsMotionType.DYNAMIC, false, scene);

        // Associate shape and body
        sphereBody.shape = sphereShape;

        // And body mass
        sphereBody.setMassProperties({ mass: 1 });


        //physicsViewer.showBody(sphereBody)
*/

        // Create a static box shape
        const groundShape = new PhysicsShapeBox(new Vector3(0, 0, 0)
            , Quaternion.Identity()
            , new Vector3(10, 0.1, 10)
            , scene);

        // Create a body and attach it to the ground. Set it as Static.
        const groundBody = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene);

        // Set material properties
        groundShape.material = { friction: 0.2, restitution: 0.8 };

        // Associate the body and the shape
        groundBody.shape = groundShape;

        // Set the mass to 0
        groundBody.setMassProperties({ mass: 0 });

var pointerDragBehavior = new SixDofDragBehavior();

       // var pointerDragBehavior = new PointerDragBehavior({});
    //    pointerDragBehavior.useObjectOrientationForDragging = false;

        pointerDragBehavior.dragDeltaRatio = 0.2;
        //this one modifies z dragging behavior
       pointerDragBehavior.zDragFactor = 0.2;

        //sphere.addBehavior(pointerDragBehavior,true);
     


        let indicatorPoint = CreateSphere("mouseBall", { diameter: 0.5, segments: 8 }, scene);
        
        var indicatorPointMat = new StandardMaterial(
            "indicatorPointMat",
            scene
        );
        indicatorPointMat.emissiveColor = new Color3(0, 1, 0);
        indicatorPointMat.alpha = 0.7;
        indicatorPoint.material = indicatorPointMat;
        indicatorPoint.isPickable = false;

        var pickingRay = new Ray(
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        );
        var rayHelper = new RayHelper(pickingRay);
        rayHelper.show(scene);
        var raycastResult = new PhysicsRaycastResult();

        var physEngine = scene.getPhysicsEngine();

        let dragPoint = CreateSphere("mouseBall", { diameter: 0.5, segments: 8 }, scene);
        dragPoint.position.x = -3
        var dragPointMat = new StandardMaterial(
            "dragPointMat",
            scene
        );
        dragPointMat.emissiveColor = new Color3(1, 0, 0);
        dragPointMat.alpha = 0.7;
        dragPoint.material = dragPointMat;
        dragPoint.isPickable = true;

              // Create a sphere shape
              const dragPointShape = new PhysicsShapeSphere(new Vector3(0, 0, 0)
              , 0.5
              , scene);
         // Sphere body
         const dragPointBody = new PhysicsBody(dragPoint, PhysicsMotionType.STATIC, false, scene);

         // Associate shape and body
         dragPointBody.shape = dragPointShape;
         //dragPoint.physicsBody.setCollisionCallbackEnabled(false)

         pointerDragBehavior.attach(dragPoint)

       // dragPoint.addBehavior(pointerDragBehavior,true);

       const constraint = new DistanceConstraint(
        1, // max distance between the two bodies
        scene
      );
      

        scene.onPointerMove = (evt, pickInfo) => {
            var hit = false;
            var hitPos = null;
    
                scene.createPickingRayToRef(
                    scene.pointerX,
                    scene.pointerY,
                    null,
                    pickingRay,
                    camera
                );
                raycastResult = physEngine.raycast(pickingRay.origin, pickingRay.origin.add(pickingRay.direction.scale(1000)));
                hit = raycastResult.hasHit;
                hitPos = raycastResult.hitPointWorld;
        
            //console.log("hit", hit, hitPos?.toString());
            if (hit) {
                indicatorPoint.isVisible = true;
                indicatorPoint.position.copyFrom(hitPos);
            }else{
              //  indicatorPoint.position = new Vector3(scene.pointerX,1, scene.pointerY)
            }
        };

        scene.onPointerDown = (evt, pickInfo) => {

            if(pickInfo.pickedMesh == ground || pickInfo.pickedMesh == dragPoint|| pickInfo.pickedMesh == indicatorPoint)
                return 

            scene.activeCamera.detachControl()

            dragPoint.position.copyFrom(indicatorPoint.position);

      
            if(pickInfo.pickedMesh)
            dragPointBody.addConstraint(pickInfo.pickedMesh.physicsBody, constraint);

          
            dragPoint.position.copyFrom(indicatorPoint.position);

            
            

        }
        scene.onPointerUp = (evt, pickInfo) => {
            scene.activeCamera.attachControl()
        }
    
        
        this.addBoxes(scene)

        return scene;
    };



    private addBoxes = (scene: Scene) => {


        const boxesToMake = 10
        let boxes : Mesh[] = []

        for(let i = 0; i < boxesToMake ; i++){

            boxes.push(CreateBox("boxxy", {width:1,height:1,depth:1}, scene))
            const boxShape = new PhysicsShapeBox(new Vector3(0, 0, 0)
            , new Quaternion(0, 0, 0)
            ,new Vector3(1, 1, 1)
            , scene);

    
            boxes[i].position.y = 6 + i ;
            boxes[i].position.x = 0;
            // Set shape material properties
            boxShape.material = { friction: 0.2, restitution: 0.6 };
    
            // Sphere body
            const sphereBody = new PhysicsBody(boxes[i], PhysicsMotionType.DYNAMIC, false, scene);
    
            // Associate shape and body
            sphereBody.shape = boxShape
    
    
            // And body mass
            sphereBody.setMassProperties({ mass: 1 })

        }



    };
}

export default new PhysicsSceneWithAmmo();