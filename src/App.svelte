<script>
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
</script>

<div class="viewport">
  <Canvas>
    <Scene />
  </Canvas>

  <div class="controls-hint">
    <span>W / S</span> Accelerate / brake
    <span>A / D</span> Turn left / right
    <span>Shift / V</span> Climb up / climb down
    <!-- <span>Mouse</span> Orbit camera -->
  </div>
</div>

<style>

  .viewport {
    width: 100vw;
    height: 100vh;
    background: #0a0a1a;
    position: relative;
  }

  .controls-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 20px;
    align-items: center;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 10px 20px;
    color: #aaaacc;
    font-family: monospace;
    font-size: 13px;
    pointer-events: none;
  }

  .controls-hint span {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 2px 7px;
    font-weight: bold;
  }
</style>