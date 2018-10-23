precision highp float;

// Uniforms
uniform float time;

// Varying
varying vec2 uvV;

void main(void) {
    vec3 color = 0.5 + 0.5*cos(time + uvV.xyx +vec3(0,2,4));

    gl_FragColor = vec4(color, 1.);
}
