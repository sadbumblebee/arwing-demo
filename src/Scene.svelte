<script>
  import { base } from '$app/paths'
  import { T, extend, useTask } from '@threlte/core'
  import { useGltf, Grid } from '@threlte/extras'
  import * as THREE from 'three'

  extend(THREE)

  const gltf = useGltf(`${base}/arwing.glb`)

  let posX = $state(0)
  let posY = $state(0)
  let posZ = $state(0)
  let rotY = $state(0)

  const TURN_SPEED = 2
  const CAM_DISTANCE = 2.25
  const CAM_HEIGHT = 1.5

  let speed = $state(4)
  const MIN_SPEED = 2
  const MAX_SPEED = 12

  let tiltZ = $state(0)
  const MAX_TILT = 0.5
  const TILT_SPEED = 4

  let tiltX = $state(0)
  const MAX_TILT_X = 0.4

  const keys = new Set()
  function onKeyDown(e) { keys.add(e.key.toLowerCase()) }
  function onKeyUp(e)   { keys.delete(e.key.toLowerCase()) }

  let camera = $state()

  let thrusterParticles
  let particlePositions = new Float32Array(30 * 3)
  let particleOpacities = new Float32Array(30)
  let pulseTimer = 0

  const particles = Array.from({ length: 30 }, () => ({
    life: 0, maxLife: 0,
    vx: 0, vy: 0, vz: 0,
    x: 0, y: 0, z: 0
  }))

  function spawnParticle(p) {
    p.life = 1
    p.maxLife = 0.1 + Math.random() * 0.15
    p.x = 0; p.y = 0; p.z = -1.3        // rear of arwing
    p.vx = (Math.random() - 0.5) * 0.3
    p.vy = (Math.random() - 0.5) * 0.3
    p.vz = -(1.5 + Math.random() * speed * 0.2)  // shoot backward (negative Z)
  }

  useTask((delta) => {
    let targetTilt = 0
    let targetTiltX = 0

    if (keys.has('a') || keys.has('arrowleft')) {
      rotY += TURN_SPEED * delta
      targetTilt = -MAX_TILT
    }
    if (keys.has('d') || keys.has('arrowright')) {
      rotY -= TURN_SPEED * delta
      targetTilt = MAX_TILT
    }
    if (keys.has('shift')) {
      posY += speed * delta
      targetTiltX = -MAX_TILT_X
    }
    if (keys.has('v')) {
      posY -= speed * delta
      targetTiltX = MAX_TILT_X
    }

    tiltZ += (targetTilt - tiltZ) * TILT_SPEED * delta
    tiltX += (targetTiltX - tiltX) * TILT_SPEED * delta

    if (keys.has('w') || keys.has('arrowup'))   speed = Math.min(speed + 10 * delta, MAX_SPEED)
    if (keys.has('s') || keys.has('arrowdown')) speed = Math.max(speed - 10 * delta, MIN_SPEED)

    posX += Math.sin(rotY) * speed * delta
    posZ += Math.cos(rotY) * speed * delta

    if (camera) {
      camera.position.set(
        posX - Math.sin(rotY) * CAM_DISTANCE,
        posY + CAM_HEIGHT,
        posZ - Math.cos(rotY) * CAM_DISTANCE
      )
      camera.lookAt(posX, posY, posZ)
    }

    // Thruster pulse
    pulseTimer -= delta
    if (pulseTimer <= 0) {
      pulseTimer = (0.4 - (speed / MAX_SPEED) * 0.3) * (0.7 + Math.random() * 0.6)
      const burst = 3 + Math.floor(speed / MAX_SPEED * 5)
      let spawned = 0
      for (const p of particles) {
        if (p.life <= 0 && spawned < burst) {
          spawnParticle(p)
          spawned++
        }
      }
    }

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (p.life > 0) {
        p.life -= delta / p.maxLife
        p.x += p.vx * delta
        p.y += p.vy * delta
        p.z += p.vz * delta
        particleOpacities[i] = Math.max(0, p.life)
      } else {
        particleOpacities[i] = 0
      }
      particlePositions[i * 3]     = p.x
      particlePositions[i * 3 + 1] = p.y
      particlePositions[i * 3 + 2] = p.z
    }

    // With this:
    if (thrusterParticles?.geometry?.attributes?.position) {
      thrusterParticles.geometry.attributes.position.needsUpdate = true
      thrusterParticles.geometry.attributes.opacity.needsUpdate = true
    }
  })
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<T.PerspectiveCamera makeDefault fov={75} bind:ref={camera} />

<T.AmbientLight intensity={1.5} />
<T.DirectionalLight position={[5, 10, 5]} intensity={2} />

{#if $gltf}
  <T.Group position={[posX, posY, posZ]} rotation={[tiltX, rotY, tiltZ, 'YZX']}>
  <!-- For checking the position of the nose of the arwing -->
  <!-- <T.Mesh position={[0, 0, 1.3]}>
    <T.SphereGeometry args={[0.1]} />
    <T.MeshBasicMaterial color="#00ff88" />
  </T.Mesh> -->
    <T is={$gltf.scene} />
    <T.Points bind:ref={thrusterParticles}>
      <T.BufferGeometry>
        <T.BufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        <T.BufferAttribute attach="attributes-opacity" args={[particleOpacities, 1]} />
      </T.BufferGeometry>
      <T.PointsMaterial
        color="#00ff88"
        size={0.5}
        transparent={true}
        depthWrite={false}
        opacity={0.9}
        sizeAttenuation={true}
      />
    </T.Points>
  </T.Group>
{/if}

<Grid
  position.y={-0.5}
  gridSize={[100, 100]}
  cellSize={1}
  cellColor="#444466"
  sectionColor="#6666aa"
  fadeDistance={30}
/>