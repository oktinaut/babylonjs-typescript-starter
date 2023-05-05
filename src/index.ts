import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene"
import { sceneObservers } from "./observers"
import "@babylonjs/core/Debug/debugLayer"
import "@babylonjs/inspector"

//import Scene1 from "./scene1"
//import scene2 from "./scene2"

import scene1 from "./scene1";

import uiScene from "./uiScene"
declare global {
    var currentSceneName: string
}
export const babylonInit = async (): Promise<void> => {
    const view = document.getElementById("view") as HTMLCanvasElement
    const engine = new Engine(view, true)
    
   
    
   // let currentScene = new Scene1(engine, view)

   let createSceneModule = scene1 //await getSceneModuleWithName("./scene1");
    // Execute the pretasks, if defined
    await Promise.all(createSceneModule.preTasks || []);

   let currentScene = await createSceneModule.createScene(engine, view);

    let guiScene = new uiScene(engine, view)
    
    guiScene.autoClear = false
    
    sceneObservers.changeScene.add((scene: Scene)  => {
       
        currentScene.dispose()

        currentScene = scene
        currentScene.performancePriority = ScenePerformancePriority.Aggressive      
        currentScene.autoClear = true
        currentScene.debugLayer.setAsActiveScene();

          //Show Babylon inspector
    currentScene.debugLayer.show()

       /* let doFade =  currentScene.fadeOut() 
        doFade.onAnimationEndObservable.add(()=>{
            currentScene = scene     
            currentScene.performancePriority = ScenePerformancePriority.Aggressive      
            currentScene.autoClear = true
            currentScene.debugLayer.setAsActiveScene();
        })
        */
    })
    
    currentScene.debugLayer.show()

    //currentScene.setupScene().then((scene) => {});
    
    engine.runRenderLoop(() => {
        currentScene.render()
        guiScene.render()
    })

}

babylonInit().then(() => {
    // scene started rendering, everything is initialized
});