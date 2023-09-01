// Vertex shader
#if defined(WEBGL2) || defines(WEBGPU)
precision highp sampler2DArray;
#endif
precision highp float;

//Attributes
attribute vec2 position;


//Uniforms
uniform vec2 u_Scale;
uniform float u_Cutoff;
#ifdef UVTRANSFORM0
uniform mat4 textureTransform;
#endif
uniform vec3 u_Color;


//Samplers
uniform sampler2D TextureSampler;


//Varyings
#ifdef UVTRANSFORM0
varying vec2 transformedUV;
#endif
#ifdef VMAINOUTPUT0
varying vec2 vMainoutput0;
#endif
varying vec2 v_output0;




//Constants
float u_Constant = 1.0;


//Entry point
void main(void) {

//Position3D
vec4 xyzw = vec4(position, 0.0, u_Constant).xyzw;

//VertexOutput
gl_Position = xyzw;

//uv0
vec2 output1 = 0.0 + (position - -1.0) * (1.0 - 0.0) / (1.0 - -1.0);

//UV scale
vec2 output0 = output1 * u_Scale;

//Texture
#ifdef UVTRANSFORM0
transformedUV = vec2(textureTransform * vec4(output0.xy, 1.0, 0.0));
#elif defined(VMAINOUTPUT0)
vMainoutput0 = output0.xy;
#endif
v_output0 = output0;

}

// Fragment shader
#if defined(WEBGL2) || defines(WEBGPU)
precision highp sampler2DArray;
#endif
precision highp float;

//Uniforms
uniform vec2 u_Scale;
uniform float u_Cutoff;
#ifdef UVTRANSFORM0
uniform mat4 textureTransform;
#endif
uniform vec3 u_Color;
uniform float textureInfoName;


//Samplers
uniform sampler2D textureSampler;
uniform sampler2D TextureSampler;


//Varyings
#ifdef UVTRANSFORM0
varying vec2 transformedUV;
#endif
#ifdef VMAINOUTPUT0
varying vec2 vMainoutput0;
#endif
varying vec2 v_output0;


//CurrentScreen
#include<helperFunctions>


//Constants
float u_Constant = 1.0;


//Entry point
void main(void) {

//CurrentScreen
vec4 tempTextureRead1 = texture2D(textureSampler, v_output0);
vec3 rgb1 = tempTextureRead1.rgb;

//Texture
#ifdef UVTRANSFORM0
vec4 tempTextureRead2 = texture2D(TextureSampler, transformedUV);
#elif defined(VMAINOUTPUT0)
vec4 tempTextureRead2 = texture2D(TextureSampler, vMainoutput0);
#endif
float b = tempTextureRead2.b * textureInfoName;
#ifdef ISGAMMA2
                b = toLinearSpace(b);
                #endif
            
//LessThan
float output3 = u_Cutoff >= b ? 1.0 : 0.0;

//Replace color
vec3 output2;
if (length(rgb1 - rgb1) < output3) {
output2 = u_Color;
} else {
output2 = rgb1;
}

//FragmentOutput
gl_FragColor = vec4(output2, 1.0);
#ifdef CONVERTTOLINEAR0
gl_FragColor = toLinearSpace(gl_FragColor);
#endif
#ifdef CONVERTTOGAMMA0
gl_FragColor = toGammaSpace(gl_FragColor);
#endif

}