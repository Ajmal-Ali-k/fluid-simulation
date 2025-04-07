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
    if (!canvas) return;

    // Set initial canvas size
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Initialize simulation
    const simulation = new FluidSimulation(canvas, config);
    simulationRef.current = simulation;
    simulation.init();

    // Initialize pointers array
    const pointers = [];
    let lastPointerId = -1;

    const getCanvasRelativePosition = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * pixelRatio,
        y: (clientY - rect.top) * pixelRatio
      };
    };

    const updatePointerDownData = (id, posX, posY) => {
      let pointer = pointers.find(p => p.id === id);
      if (!pointer) {
        pointer = {
          id,
          texcoordX: 0,
          texcoordY: 0,
          prevTexcoordX: 0,
          prevTexcoordY: 0,
          deltaX: 0,
          deltaY: 0,
          down: false,
          moved: false,
          color: generateColor()
        };
        pointers.push(pointer);
      }
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
      pointer.color = generateColor();
    };

    const updatePointerMoveData = (id, posX, posY) => {
      const pointer = pointers.find(p => p.id === id);
      if (!pointer || !pointer.down) return;
      
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.deltaX = simulation.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = simulation.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    };

    const updatePointerUpData = (id) => {
      const pointer = pointers.find(p => p.id === id);
      if (pointer) {
        pointer.down = false;
      }
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

    // Add resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      simulation.init();
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
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
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      gui.destroy();
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
