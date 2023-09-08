import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene"
import { sceneObservers } from "./observers"
import "@babylonjs/core/Debug/debugLayer"
import "@babylonjs/inspector"

//import Scene1 from "./scene1"
//import scene2 from "./scene2"

import scene1 from "./scene1";

import uiScene from "./uiScene"
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial"
import { Constants } from "@babylonjs/core/Engines/constants"
import { Texture } from "@babylonjs/core/Materials/Textures/texture"

import { Animation } from "@babylonjs/core/Animations/animation"
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess"
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup"
import { Effect } from "@babylonjs/core/Materials/effect"

const gradFadeJson = require('./Materials/NME/gradFade.json')
export let currentScene : Scene;
//@ts-ignore
import gradFadeTex from "./Materials/NME/8.png"
import { Observable, float } from "@babylonjs/core"

//const gradFadeTex = require('./Materials/NME/8.png')

declare global {
    var test: string
}
export const babylonInit = async (): Promise<void> => {
    const view = document.getElementById("view") as HTMLCanvasElement
    const engine = new Engine(view, true)

    let createSceneModule = scene1 //await getSceneModuleWithName("./scene1");
    // Execute the pretasks, if defined
    await Promise.all(createSceneModule.preTasks || []);

    currentScene = await createSceneModule.createScene(engine, view);

    let guiScene = new uiScene(engine, view)

    guiScene.autoClear = false
    
    sceneObservers.changeScene.addOnce(async (nextScene: Scene) => {

        //Dispose currently rendering scene 
        currentScene.dispose()

        currentScene = nextScene

        //await screenFade(currentScene,.0,1.0)

        currentScene.performancePriority = ScenePerformancePriority.Aggressive
        currentScene.autoClear = true
        currentScene.debugLayer.setAsActiveScene();

        //Show Babylon inspector
        guiScene.debugLayer.show()

        await screenFade(currentScene,1.0,.0)
    })

    guiScene.debugLayer.show()

    //currentScene.setupScene().then((scene) => {});

    engine.runRenderLoop(() => {
        currentScene.render()
        guiScene.render()
    })

};

babylonInit().then(() => {
    // scene started rendering, everything is initialized
});

function getCurrentScene() : Scene {

    return currentScene
}


function screenFade(scene : Scene, startValue : float, endValue : float): Promise<void> {

    
    return new Promise((resolve, reject) => {

        let nodeMaterial = NodeMaterial.Parse(gradFadeJson, scene);

        let nodeInput = nodeMaterial.getInputBlockByPredicate((b) => b.name === "Cutoff");

        let nodeTexture = nodeMaterial.getBlockByName("Texture"); //nodeMaterial.getInputBlockByPredicate((b) => b.name === "Texture");
        //@ts-ignore
        nodeTexture.texture = new Texture(gradFadeTex);

        let postProcess = nodeMaterial.createPostProcess(scene.activeCamera, 1.0, Constants.TEXTURE_LINEAR_LINEAR);

        let fadeLevel = {
            value: startValue
        };

        postProcess.onApply = (effect) => {
            nodeInput.value = fadeLevel.value;
        };
        
        let ppAni = new AnimationGroup('ppAni', this);
        ppAni.normalize(0, 100);

        let animation = new Animation('fadeAnim', "value", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
        postProcess.animations.push(animation);


        let fadeKeys = [
            { frame: 0, value: startValue },
            { frame: 100, value: endValue }
        ];

        animation.setKeys(fadeKeys);

        ppAni.addTargetedAnimation(animation, fadeLevel);
        ppAni.play();


        // Add an observer that will resolve the promise when the animation ends
        ppAni.onAnimationEndObservable.addOnce(() => {

          //  ppAni.dispose()
            nodeMaterial.dispose()
            postProcess.dispose()
            resolve();
        });
    });
}
