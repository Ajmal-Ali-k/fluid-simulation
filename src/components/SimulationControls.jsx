import { useEffect, useRef } from 'react';
import * as dat from 'dat.gui';
import { config } from '../config';

const SimulationControls = ({ simulation }) => {
  const guiRef = useRef(null);

  useEffect(() => {
    const gui = new dat.GUI();
    guiRef.current = gui;

    const simFolder = gui.addFolder('Simulation');
    simFolder.add(config, 'SIM_RESOLUTION', { '32': 32, '64': 64, '128': 128, '256': 256 })
      .name('Resolution')
      .onChange(() => {
        simulation?.initFramebuffers();
      });
    simFolder.add(config, 'DYE_RESOLUTION', { '512': 512, '1024': 1024, '2048': 2048 })
      .name('Quality')
      .onChange(() => {
        simulation?.initFramebuffers();
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
    displayFolder.add(config, 'BLOOM_RESOLUTION', { '256': 256, '512': 512, '1024': 1024 })
      .name('Bloom Quality');
    displayFolder.add(config, 'BLOOM_INTENSITY', 0, 1).name('Bloom Intensity');
    displayFolder.add(config, 'BLOOM_THRESHOLD', 0, 1).name('Bloom Threshold');
    displayFolder.add(config, 'BLOOM_SOFT_KNEE', 0, 1).name('Bloom Soft Knee');
    displayFolder.add(config, 'SUNRAYS').name('Sunrays');
    displayFolder.add(config, 'SUNRAYS_RESOLUTION', { '256': 256, '512': 512, '1024': 1024 })
      .name('Sunrays Quality');
    displayFolder.add(config, 'SUNRAYS_WEIGHT', 0, 1).name('Sunrays Weight');

    return () => {
      gui.destroy();
    };
  }, [simulation]);

  return null;
};

export default SimulationControls; 