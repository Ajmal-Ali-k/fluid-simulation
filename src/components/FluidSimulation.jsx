import { useEffect, useRef } from 'react';
import { FluidSimulation as FluidSimulationClass } from '../fluidSimulation';
import { config } from '../config';
import { generateColor } from '../webglUtils';

const FluidSimulation = () => {
  const canvasRef = useRef(null);
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
    const simulation = new FluidSimulationClass(canvas, config);
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
          down: true,
          moved: true,
          color: generateColor()
        };
        pointers.push(pointer);
      }
      pointer.id = id;
      pointer.down = true;
      pointer.moved = true;
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
      if (!pointer) return;
      
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.deltaX = simulation.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = simulation.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = true;
    };

    const updatePointerUpData = (id) => {
      const pointer = pointers.find(p => p.id === id);
      if (pointer) {
        pointer.down = false;
        pointer.moved = false;
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

    // Add event listeners to document instead of canvas
    window.addEventListener('resize', handleResize);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointerleave', handlePointerUp);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointerleave', handlePointerUp);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};

export default FluidSimulation; 