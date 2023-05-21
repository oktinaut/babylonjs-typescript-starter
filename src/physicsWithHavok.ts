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
import { BallAndSocketConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint"
import { Color3 } from "@babylonjs/core/Maths/math.color"
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder"
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate"
import { PhysicsRaycastResult } from "@babylonjs/core/Physics/physicsRaycastResult"
import { PointerDragBehavior } from "@babylonjs/core"
import { Ray } from "@babylonjs/core/Culling/ray"
import { RayHelper } from "@babylonjs/core/Debug/rayHelper";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
class PhysicsSceneWithHavok implements CreateSceneClass {
    preTasks = [havokModule];

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

        var pointerDragBehavior = new PointerDragBehavior();

        pointerDragBehavior.useObjectOrientationForDragging = true;

        pointerDragBehavior.dragDeltaRatio = 0.3

        pointerDragBehavior.maxDragAngle = 1

        let indicatorPoint = CreateSphere("mouseHitBall", { diameter: 0.25, segments: 8 }, scene);
        var indicatorPointMat = new StandardMaterial(
            "indicatorPointMat",
            scene
        );
        indicatorPointMat.emissiveColor = new Color3(0, 1, 0);
        indicatorPointMat.alpha = 0.7;
        indicatorPoint.material = indicatorPointMat;
        indicatorPoint.isPickable = false;

        let pickingRay = new Ray(
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        );

        var rayHelper = new RayHelper(pickingRay);
        rayHelper.show(scene);
        var raycastResult = new PhysicsRaycastResult();

        var physEngine = scene.getPhysicsEngine();

        let dragPoint = CreateSphere("mouseBall", { diameter: 0.5, segments: 8 }, scene);
        dragPoint.position.x = -3

        dragPoint.visibility = 0
        pointerDragBehavior.attach(dragPoint)

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

            if (hit) {
                indicatorPoint.isVisible = true;
                indicatorPoint.position.copyFrom(hitPos);
            } else {
                //  indicatorPoint.position = new Vector3(scene.pointerX,1, scene.pointerY)
            }
        };

        scene.onPointerDown = (evt, pickInfo) => {

            if (pickInfo.pickedMesh == ground || pickInfo.pickedMesh == dragPoint || pickInfo.pickedMesh == indicatorPoint || pickInfo.pickedMesh == null)
                return

            scene.activeCamera.detachControl()

            dragPoint.position.copyFrom(indicatorPoint.position)

            const localCorrds = Vector3.TransformCoordinates(indicatorPoint.position, pickInfo.pickedMesh.getWorldMatrix().clone().invert())

            let sphereAggregate = new PhysicsAggregate(dragPoint, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, scene);
            dragPoint.physicsBody.setMotionType(PhysicsMotionType.STATIC)
            dragPoint.physicsBody.disablePreStep = false;


            let constraint = new BallAndSocketConstraint(
                Vector3.Zero(),
                localCorrds,
                new Vector3(0, 0, 0),
                new Vector3(0.1,0.1,0.1),
                scene
            )
            pointerDragBehavior.startDrag()

            dragPoint.physicsBody.addConstraint(pickInfo.pickedMesh.physicsBody, constraint);
        }
        scene.onPointerUp = (evt, pickInfo) => {
            pointerDragBehavior.releaseDrag()
            if (dragPoint.physicsBody) {
                dragPoint.physicsBody.dispose()
            }
            scene.activeCamera.attachControl()
        }
        this.addBoxes(scene)
        return scene;
    };

    private addBoxes = (scene: Scene) => {
        const boxesToMake = 10
        let boxes: Mesh[] = []
        for (let i = 0; i < boxesToMake; i++) {
            boxes.push(CreateBox(`box-${i}`, { width: 1, height: 1, depth: 1 }, scene))
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