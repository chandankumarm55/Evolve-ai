import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AdditiveBlending } from "three";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import './LandingPage.css'

const LandingPage = () => {
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const scene = new THREE.Scene();
        const canvas = canvasRef.current;

        // Fixed parameters without GUI controls
        const parameters = {
            count: 700000,
            size: 0.015,
            radius: 2,
            branches: 20,
            spin: 8,
            randomness: 0.1,
            randomnessPower: 5,
            stars: 90000,
            starColor: "#1b3984",
            insideColor: "#edaa97",
            outsideColor: "#1b3984",
            particleSpeed: 0.1,
            zRange: 10
        };

        let geometry = null;
        let material = null;
        let points = null;
        let particleVelocities = [];

        function generateGalaxy() {
            if (points !== null) {
                geometry.dispose();
                material.dispose();
                scene.remove(points);
            }

            geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(parameters.count * 3);
            const colors = new Float32Array(parameters.count * 3);
            particleVelocities = [];

            const colorInside = new THREE.Color(parameters.insideColor);
            const colorOutside = new THREE.Color(parameters.outsideColor);

            for (let i = 0; i < parameters.count; i++) {
                const radius = Math.random() * parameters.radius;
                const branchAngle = (i % parameters.branches) / parameters.branches * 2 * Math.PI;
                const spinAngle = radius * parameters.spin;

                // Initialize positions
                positions[i * 3] = Math.sin(branchAngle + spinAngle) * radius;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
                positions[i * 3 + 2] = Math.cos(branchAngle + spinAngle) * radius;

                // Initialize velocities for z-axis movement
                particleVelocities.push({
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * parameters.particleSpeed
                });

                const mixedColor = colorInside.clone();
                mixedColor.lerp(colorOutside, radius / parameters.radius);

                colors[i * 3] = mixedColor.r;
                colors[i * 3 + 1] = mixedColor.g;
                colors[i * 3 + 2] = mixedColor.b;
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

            material = new THREE.PointsMaterial({
                size: parameters.size,
                depthWrite: false,
                blending: AdditiveBlending,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            points = new THREE.Points(geometry, material);
            scene.add(points);
        }

        generateGalaxy();

        // Camera and renderer setup
        const sizes = { width: window.innerWidth, height: window.innerHeight };
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
        camera.position.set(0, 2, 10);
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Animation loop
        const clock = new THREE.Clock();

        const updateParticles = () => {
            const positions = points.geometry.attributes.position.array;

            for (let i = 0; i < parameters.count; i++) {
                const i3 = i * 3;

                // Update positions based on velocities
                positions[i3] += particleVelocities[i].x;
                positions[i3 + 1] += particleVelocities[i].y;
                positions[i3 + 2] += particleVelocities[i].z;

                // Reset particles when they go too far
                if (Math.abs(positions[i3 + 2]) > parameters.zRange) {
                    positions[i3 + 2] *= -0.99;
                    particleVelocities[i].z *= -1;
                }
            }

            points.geometry.attributes.position.needsUpdate = true;
        };

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            updateParticles();
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };

        tick();

        // Handle window resize
        window.addEventListener('resize', () => {
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
            renderer.setSize(sizes.width, sizes.height);
        });

        // Cleanup
        return () => {
            renderer.dispose();
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, []);

    // Handle down arrow click to navigate to the "Evolve" route
    const handleArrowClick = () => {
        navigate("/evolve"); // Navigate to "Evolve" page
    };

    return (
        <div style={ { position: 'relative', width: '100vw', height: '100vh' } }>
            <canvas ref={ canvasRef } style={ { position: 'absolute', top: 0, left: 0 } } />
            <div style={ {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            } }>
                <h1 style={ {
                    fontSize: '4rem',
                    marginBottom: '2rem',
                    textAlign: 'center'
                } }>
                    Evolve <span style={ { color: '#ff6030' } }>AI Power</span>
                </h1>
                <div
                    onClick={ handleArrowClick }
                    style={ {
                        animation: 'bounce 1.5s infinite',
                        cursor: 'pointer'
                    } }
                >
                    <MdKeyboardDoubleArrowDown size={ 48 }
                        color="#ff6030"
                        style={ {
                            filter: 'drop-shadow(2px 2px 10px rgba(0,0,0,0.5))'
                        } } />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
