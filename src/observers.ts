import { Observable } from "@babylonjs/core/Misc/observable"
class SceneObservers {
    changeScene = new Observable()
}

export const sceneObservers = new SceneObservers()