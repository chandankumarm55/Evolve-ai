import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AdditiveBlending } from "three";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const frameIdRef = useRef(null);
    const navigate = useNavigate();

    const parameters = useMemo(() => ({
        count: 700000,
        size: 0.015,
        radius: 2,
        branches: 20,
        spin: 8,
        randomness: 0.1,
        randomnessPower: 5,
        starColor: "#1b3984",
        insideColor: "#edaa97",
        outsideColor: "#1b3984",
        particleSpeed: 0.1,
        zRange: 10
    }), []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 2, 10);

        // Renderer setup with optimized parameters
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Controls setup
        const controls = new OrbitControls(camera, canvasRef.current);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Galaxy generation
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);
        const velocities = new Float32Array(parameters.count * 3);

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * parameters.radius;
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
            const spinAngle = radius * parameters.spin;

            positions[i3] = Math.sin(branchAngle + spinAngle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 2;
            positions[i3 + 2] = Math.cos(branchAngle + spinAngle) * radius;

            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * parameters.particleSpeed;

            const mixedColor = colorInside.clone().lerp(colorOutside, radius / parameters.radius);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: parameters.size,
            depthWrite: false,
            blending: AdditiveBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Optimized animation loop
        const clock = new THREE.Clock();
        let lastTime = 0;
        const interval = 1000 / 60; // 60 FPS target

        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;

            if (deltaTime > interval) {
                lastTime = currentTime - (deltaTime % interval);

                const positions = points.geometry.attributes.position.array;
                for (let i = 0; i < parameters.count; i++) {
                    const i3 = i * 3;
                    positions[i3] += velocities[i3];
                    positions[i3 + 1] += velocities[i3 + 1];
                    positions[i3 + 2] += velocities[i3 + 2];

                    if (Math.abs(positions[i3 + 2]) > parameters.zRange) {
                        positions[i3 + 2] *= -0.99;
                        velocities[i3 + 2] *= -1;
                    }
                }
                points.geometry.attributes.position.needsUpdate = true;

                controls.update();
                renderer.render(scene, camera);
            }

            frameIdRef.current = requestAnimationFrame(animate);
        };

        frameIdRef.current = requestAnimationFrame(animate);

        // Optimized resize handler
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameIdRef.current);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            controls.dispose();
        };
    }, [parameters]);

    return (
        <div className="relative w-screen h-screen">
            <canvas ref={ canvasRef } className="absolute top-0 left-0" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
                <h1 className="text-6xl mb-8">
                    Evolve <span className="text-[#ff6030]">AI Power</span>
                </h1>
                <div
                    onClick={ () => navigate("/evolve") }
                    className="animate-bounce cursor-pointer"
                >
                    <MdKeyboardDoubleArrowDown
                        size={ 48 }
                        color="#ff6030"
                        className="filter drop-shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;