import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import { CreateSceneClass } from "./createScene";
import { havokModule } from "./externals/havok";
import { PhysicsShapeBox } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType, PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { BallAndSocketConstraint, LockConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint"
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color"
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder"
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate"
import { PhysicsRaycastResult } from "@babylonjs/core/Physics/physicsRaycastResult"
import { AbstractMesh, PointerDragBehavior, PointerEventTypes } from "@babylonjs/core"
import { Ray } from "@babylonjs/core/Culling/ray"
import { RayHelper } from "@babylonjs/core/Debug/rayHelper";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";

class PhysicsSceneWithHavok implements CreateSceneClass {
    preTasks = [havokModule];
    draggingMesh: AbstractMesh;
    indicatorPoint: AbstractMesh;
    anchor: AbstractMesh;
    dragPoint: AbstractMesh;

    
    createScene = async (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 10, new Vector3(0, 0, 0), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'ground' shape.
        const ground = CreateGround("ground", { width: 40, height: 40 }, scene);

        // PHYSICS!
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));

        //var physicsViewer = new PhysicsViewer();
        //physicsViewer.showBody(sphereBody)

        // Create a static box shape
        const groundShape = new PhysicsShapeBox(new Vector3(0, 0, 0)
            , Quaternion.Identity()
            , new Vector3(ground._width, 0.1, ground._height)
            , scene);

        // Create a body and attach it to the ground. Set it as Static.
        const groundBody = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene);

        // Set material properties
        groundShape.material = { friction: 0.2, restitution: 0.8 };

        // Associate the body and the shape
        groundBody.shape = groundShape;

        // Set the mass to 0
        groundBody.setMassProperties({ mass: 0 });

        let pointerDragBehavior = new PointerDragBehavior();

        pointerDragBehavior.useObjectOrientationForDragging = true;
        pointerDragBehavior.dragDeltaRatio = 0.3
        pointerDragBehavior.maxDragAngle = 1

        this.indicatorPoint = CreateSphere("rayHitBall", { diameter: 0.25, segments: 8 }, scene);
        const indicatorPointMat = new StandardMaterial(
            "indicatorPointMat",
            scene
        );
        indicatorPointMat.emissiveColor = new Color3(0, 1, 0);
        indicatorPointMat.alpha = 0.7;
        this.indicatorPoint.material = indicatorPointMat;
        this.indicatorPoint.isPickable = false;

        let pickingRay = new Ray(
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        );

     //   var rayHelper = new RayHelper(pickingRay);
       // rayHelper.show(scene);
        var raycastResult = new PhysicsRaycastResult();

        var physEngine = scene.getPhysicsEngine();

        this.anchor = CreateSphere("anchorMesh", { diameter: 0.5, segments: 8 }, scene);
        this.anchor.isPickable = false;


        this.dragPoint = CreateSphere("mouseBall", { diameter: 0.5, segments: 8 }, scene);
        this.dragPoint.position.x = -3
        this.dragPoint.isPickable = false
        this.dragPoint.visibility = 1
        this.dragPoint.setEnabled(false)


        pointerDragBehavior.attach(this.dragPoint)

        let pointerDown: boolean = false

        // Add a listener for pointer events
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {

                case PointerEventTypes.POINTERDOWN:

                this.dragPoint.setEnabled(true)
                this.anchor.setEnabled(true)



                if (pointerInfo.pickInfo.hit === false)
                    return
        

                
                    if (pointerInfo.pickInfo.pickedMesh == ground || this.draggingMesh == pointerInfo.pickInfo.pickedMesh || pointerInfo.pickInfo.pickedMesh ==  this.dragPoint || pointerInfo.pickInfo.pickedMesh == this.indicatorPoint || pointerInfo.pickInfo.pickedMesh == null)
                        return

                    this.draggingMesh = pointerInfo.pickInfo.pickedMesh


                    this.anchorMeshToMouse(scene)
                    

                    //check point


                    scene.activeCamera.detachControl()

                    if (!pickingRay)
                        return                 
                    pointerDragBehavior.startDrag()

                    // Set the pointer down state to true
                    pointerDown = true;
                break;

                case PointerEventTypes.POINTERUP:

                    pointerDragBehavior.releaseDrag()
                    if ( this.dragPoint.physicsBody) {
                        this.dragPoint.physicsBody.dispose()
                    }


                if (this.anchor.physicsBody)
                    this.anchor.physicsBody.dispose()

                    if(this.draggingMesh)
                        this.draggingMesh = null
        
                //box.physicsBody.setLinearDamping(0.0)
        
             this.anchor.setEnabled(false)
              this.dragPoint.setEnabled(false)

        
                pointerDragBehavior.dragging = false

                    pointerInfo.pickInfo.pickedMesh
                    scene.activeCamera.attachControl()
                    // Set the pointer down state to false
                    pointerDown = false;
                 break;

                case PointerEventTypes.POINTERMOVE:

                    let hit = false;
                    let hitPos = null;

                    if (!pickingRay)
                        return

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

                    if (hit) {
                        this.indicatorPoint.isVisible = true;
                        this.indicatorPoint.position.copyFrom(hitPos)
                    }

                    // Check if the pointer down state is true
                    if (pointerDown) {

                        if (pointerInfo.pickInfo.pickedMesh == ground || this.draggingMesh == pointerInfo.pickInfo.pickedMesh || pointerInfo.pickInfo.pickedMesh ==  this.dragPoint || pointerInfo.pickInfo.pickedMesh == this.indicatorPoint || pointerInfo.pickInfo.pickedMesh == null)
                        return

                        // Do something when the mouse is moving and the mouse down event is on
                        //console.log("Mouse move and mouse down");
                    }
                break;
            }
        });

        pointerDragBehavior.onDragStartObservable.add(() => {
           // moving = true
        })
    
        pointerDragBehavior.onDragEndObservable.add(() => {
           // moving = false
        })
    
        scene.onAfterRenderObservable.add(() => {
            if (pointerDragBehavior.dragging) {
                const flatDistance = Vector3.DistanceSquared(this.dragPoint.position, this.draggingMesh.position)
                const force = 40 * flatDistance
                this.anchor.physicsBody.applyForce(this.dragPoint.position.subtract(this.anchor.position).scale(force), this.anchor.position);
            }
        })
    


        this.addBoxes(scene)
        return scene;
    };

    private anchorMeshToMouse = (scene: Scene) => {

        this.dragPoint.setEnabled(true)

        this.dragPoint.position.copyFrom(this.indicatorPoint.position)

        this.anchor.position = this.indicatorPoint.position.clone()

        const anchorBody = new PhysicsAggregate(this.anchor, PhysicsShapeType.SPHERE, { mass: 0.1, restitution: 0.0 }, scene);
        this.anchor.physicsBody.setMotionType(PhysicsMotionType.DYNAMIC)
        anchorBody.body.disablePreStep = false;

        this.anchor.physicsBody.disablePreStep = false;
        this.anchor.physicsBody.setLinearDamping(200.0)
        this.anchor.physicsBody.setAngularDamping(200.0)

        const localAnchorCorrds = Vector3.TransformCoordinates(this.anchor.position, this.draggingMesh.getWorldMatrix().clone().invert())
        localAnchorCorrds.x = Scalar.Clamp(localAnchorCorrds.x, -1, 1)
        localAnchorCorrds.y = Scalar.Clamp(localAnchorCorrds.y, -1, 1)
        localAnchorCorrds.z = Scalar.Clamp(localAnchorCorrds.z, -1, 1)

        let anchorJoint = new LockConstraint(
            Vector3.Zero(),
            localAnchorCorrds,
            new Vector3(0.5, 0.5, 0.5),
            new Vector3(0, 1, 0),
            scene
        )   

        this.anchor.physicsBody.addConstraint(this.draggingMesh.physicsBody, anchorJoint);

    }

    private addBoxes = (scene: Scene) => {
        const boxesToMake = 5

        const faceColors = new Array(6);
        faceColors[0] = new Color4(1, 0, 0, 1);   // red front
        faceColors[1] = new Color4(0, 1, 0, 1);   // green top
        faceColors[2] = new Color4(0, 0, 1, 1);   // blue top
        faceColors[3] = new Color4(1, 1, 0, 1);   // yellow top
        faceColors[4] = new Color4(0, 1, 1, 1);   // cyan top
        faceColors[5] = new Color4(1, 0, 1, 1);   // magenta top

        const options = {
            size: 1,
            faceColors: faceColors
        };
        let boxes: Mesh[] = []
        for (let i = 0; i < boxesToMake; i++) {
            boxes.push(CreateBox(`box-${i}`, options, scene))
            const boxShape = new PhysicsShapeBox(new Vector3(0, 0, 0)
                , new Quaternion(0, 0, 0)
                , new Vector3(1, 1, 1)
                , scene);
            boxes[i].position.y = 6 + i;
            boxes[i].position.x = 0;
            // Set shape material properties
            boxShape.material = { friction: 0.2, restitution: 0.6 };

            // Sphere body
            const boxBody = new PhysicsBody(boxes[i], PhysicsMotionType.DYNAMIC, false, scene);

            // Associate shape and body
            boxBody.shape = boxShape

            // And body mass
            boxBody.setMassProperties({ mass: 1 })
        }
    };
}

export default new PhysicsSceneWithHavok();