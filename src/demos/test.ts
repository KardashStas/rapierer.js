import type { Testbed } from "../Testbed";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export function initWorld(RAPIER: RAPIER_API, testbed: Testbed) {
  let gravity = new RAPIER.Vector2(0.0, -9.81);
  let world = new RAPIER.World(gravity);

  // Create Ground.
  let groundSize = 40.0;
  let grounds = [
    { x: 0.0, y: 0.0, hx: groundSize, hy: 0.1 },
    { x: -groundSize, y: groundSize, hx: 0.1, hy: groundSize },
    { x: groundSize, y: groundSize, hx: 0.1, hy: groundSize },
  ];

  grounds.forEach((ground) => {
    let bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      ground.x,
      ground.y
    );
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(ground.hx, ground.hy);
    world.createCollider(colliderDesc, body);
  });

  const radius = 2;

  // Create dynamic cube.
  let bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(20, 20)
    // .setLinearDamping(1)
    .setAngularDamping(100);
  let body = world.createRigidBody(bodyDesc);
  let colliderDesc = RAPIER.ColliderDesc.ball(radius)
    // .setDensity(1)
    .setRestitution(0.6)
    .setFriction(0.0001);
  world.createCollider(colliderDesc, body);

  const moveForce = 500;
  const maxSpeed = 15;
  const jumpSpeed = 15;
  const keys: Record<string, boolean> = {};
  let onGround = false;

  const update = () => {
    const down = { x: 0.0, y: -1.0 };
    let ray = new RAPIER.Ray(
      { x: body.translation().x, y: body.translation().y - (radius + 0.01) },
      down
    );
    let maxToi = 0.01;

    let hit = world.castRay(ray, maxToi, true);
    onGround = !!hit;

    body.resetForces(true);

    if (keys["KeyA"]) {
      if (body.linvel().x > -maxSpeed) {
        body.addForce({ x: -moveForce, y: 0 }, true);
      }
    } else if (keys["KeyD"]) {
      if (body.linvel().x < maxSpeed) {
        body.addForce({ x: moveForce, y: 0 }, true);
      }
    }

    if (onGround && keys["Space"]) {
      body.setLinvel({ x: body.linvel().x, y: jumpSpeed }, true);
    }

    requestAnimationFrame(update);
  };

  update();

  document.addEventListener("keydown", ({ code }) => {
    keys[code] = true;
  });

  document.addEventListener("keyup", ({ code }) => {
    delete keys[code];
  });

  testbed.setWorld(world);
  testbed.lookAt({
    target: { x: 0.0, y: -1.0 },
    zoom: 10.0,
  });
}
