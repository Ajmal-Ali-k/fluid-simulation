import { useEffect, useRef } from 'react';
import * as dat from 'dat.gui';
import { FluidSimulation } from './fluidSimulation';
import { config } from './config';
import { generateColor } from './webglUtils';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const guiRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const simulation = new FluidSimulation(canvas, config);
    simulation.init();

    // Handle pointer events
    const pointers = [];
    let lastPointerId = -1;

    const updatePointerDownData = (id, posX, posY) => {
      pointers.push({
        id,
        x: posX,
        y: posY,
        prevX: posX,
        prevY: posY,
        deltaX: 0,
        deltaY: 0,
        moved: false,
        color: generateColor()
      });
    };

    const updatePointerMoveData = (id, posX, posY) => {
      const pointer = pointers.find(p => p.id === id);
      if (pointer) {
        pointer.deltaX = (posX - pointer.prevX) * 10.0; // Scale up the delta
        pointer.deltaY = (posY - pointer.prevY) * 10.0; // Scale up the delta
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
        pointer.x = posX;
        pointer.y = posY;
      }
    };

    const updatePointerUpData = (id) => {
      const index = pointers.findIndex(p => p.id === id);
      if (index > -1) {
        pointers.splice(index, 1);
      }
    };

    const getCanvasRelativePosition = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1.0 - (clientY - rect.top) / rect.height; // Flip Y coordinate
      return { x, y };
    };

    const handlePointerDown = (e) => {
      const pos = getCanvasRelativePosition(e.clientX, e.clientY);
      lastPointerId = e.pointerId;
      updatePointerDownData(e.pointerId, pos.x, pos.y);
      simulation.pointers = pointers;
      e.preventDefault();
    };

    const handlePointerMove = (e) => {
      const pos = getCanvasRelativePosition(e.clientX, e.clientY);
      updatePointerMoveData(e.pointerId, pos.x, pos.y);
      simulation.pointers = pointers;
      e.preventDefault();
    };

    const handlePointerUp = (e) => {
      updatePointerUpData(e.pointerId);
      if (e.pointerId === lastPointerId) {
        lastPointerId = -1;
      }
      simulation.pointers = pointers;
      e.preventDefault();
    };

    // Add event listeners
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    // GUI setup
    const gui = new dat.GUI();
    const simFolder = gui.addFolder('Simulation');
    simFolder.add(config, 'SIM_RESOLUTION', { '32': 32, '64': 64, '128': 128, '256': 256 }).name('Resolution').onChange(() => {
      simulation.initFramebuffers();
    });
    simFolder.add(config, 'DYE_RESOLUTION', { '512': 512, '1024': 1024, '2048': 2048 }).name('Quality').onChange(() => {
      simulation.initFramebuffers();
    });
    simFolder.add(config, 'DENSITY_DISSIPATION', 0, 1).name('Density Diffusion');
    simFolder.add(config, 'VELOCITY_DISSIPATION', 0, 1).name('Velocity Diffusion');
    simFolder.add(config, 'PRESSURE', 0, 1).name('Pressure');
    simFolder.add(config, 'PRESSURE_ITERATIONS', 1, 50).name('Pressure Iterations');
    simFolder.add(config, 'CURL', 0, 50).name('Curl');
    simFolder.add(config, 'SPLAT_RADIUS', 0.01, 1).name('Splat Radius');
    simFolder.add(config, 'SPLAT_FORCE', 0, 10000).name('Splat Force');
    simFolder.add(config, 'SHADING').name('Shading');
    simFolder.add(config, 'COLORFUL').name('Colorful');
    simFolder.add(config, 'PAUSED').name('Paused');

    const displayFolder = gui.addFolder('Display');
    displayFolder.add(config, 'BLOOM').name('Bloom');
    displayFolder.add(config, 'BLOOM_ITERATIONS', 1, 20).name('Bloom Iterations');
    displayFolder.add(config, 'BLOOM_RESOLUTION', { '256': 256, '512': 512, '1024': 1024 }).name('Bloom Quality');
    displayFolder.add(config, 'BLOOM_INTENSITY', 0, 1).name('Bloom Intensity');
    displayFolder.add(config, 'BLOOM_THRESHOLD', 0, 1).name('Bloom Threshold');
    displayFolder.add(config, 'BLOOM_SOFT_KNEE', 0, 1).name('Bloom Soft Knee');
    displayFolder.add(config, 'SUNRAYS').name('Sunrays');
    displayFolder.add(config, 'SUNRAYS_RESOLUTION', { '256': 256, '512': 512, '1024': 1024 }).name('Sunrays Quality');
    displayFolder.add(config, 'SUNRAYS_WEIGHT', 0, 1).name('Sunrays Weight');

    // Cleanup
    return () => {
      gui.destroy();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, []);

  return (
    <div className="app">
      <h1 className="intro">Fluid Simulation</h1>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default App;
