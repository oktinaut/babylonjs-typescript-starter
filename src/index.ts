import { Engine } from "@babylonjs/core/Engines/engine"

import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene"
import { sceneObservers } from "./observers"
import "@babylonjs/core/Debug/debugLayer"
import "@babylonjs/inspector"

import Scene1 from "./scene1"
import scene2 from "./scene2"
import uiScene from "./uiScene"


const view = document.getElementById("view") as HTMLCanvasElement
const engine = new Engine(view, true)

declare global {
    var currentSceneName: string
}

let currentScene = new Scene1(engine, view)
let guiScene = new uiScene(engine, view)

guiScene.autoClear = false

sceneObservers.changeScene.add((scene: Scene) => {
    let doFade =  currentScene.fadeOut() 
    doFade.onAnimationEndObservable.add(()=>{
        currentScene = scene     
        currentScene.performancePriority = ScenePerformancePriority.Aggressive      
        currentScene.autoClear = true
        currentScene.debugLayer.setAsActiveScene();
    })
})

//Show Babylon inspector
currentScene.debugLayer.show()

engine.runRenderLoop(() => {
    currentScene.render()
    guiScene.render()
})