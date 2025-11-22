import { GoogleGenAI, Type } from "@google/genai";
import { Scene, RewriteAction, CharacterProfile, FormInputs } from '../types';

const LOCAL_STORAGE_KEY_API = 'VEO_API_KEY';

const getApiKey = (): string => {
  // 1. Try to get from Local Storage (User entered)
  const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_API);
  if (storedKey && storedKey.trim().length > 0) {
    return storedKey;
  }

  // 2. Fallback to Environment Variable
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }

  // 3. Throw specific error if neither exists
  throw new Error("API Key is missing. Please click the Settings (Gear) icon in the top right to enter your Google Gemini API Key.");
};

const getGenAI = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

const PREHISTORIC_STYLE = "Phim tài liệu điện ảnh về thời tiền sử (Cinematic Prehistoric Documentary)";
const SURVIVAL_STYLE = "Phim ngắn sinh tồn không lời thoại (Wordless Survival Short Film)";

const sceneSchema = {
    type: Type.OBJECT,
    properties: {
        sceneNumber: { type: Type.INTEGER, description: "The sequential number of the scene." },
        shortDescription: { type: Type.STRING, description: "A very brief, one-sentence summary of this 8-second scene's main action. IMPORTANT: This specific field is for the user interface ONLY and MUST be written in VIETNAMESE. All other descriptive fields must follow the English-only rule." },
        videoStyle: { type: Type.STRING, description: "Cinematic style (e.g., sci-fi noir, hyper-realistic, found footage). This MUST match the user's selected style and be in English." },
        countryContext: { type: Type.STRING, description: "Cultural context, references, or nuances tailored for viewers from the specified country." },
        characterDescription: { type: Type.STRING, description: "Detailed description of each character in the scene. CRITICAL REQUIREMENT: To ensure the video AI correctly attributes dialogue, you MUST strictly use the format 'CHARACTER NAME: [Visual Description]'. Example: 'LAN: A young woman in a white Ao Dai'. List each character on a new line starting with a hyphen. Do not use shorthand." },
        visuals: { type: Type.STRING, description: "Detailed description of the visual elements, setting, and action, reflecting the chosen video style." },
        camera: { type: Type.STRING, description: "Specific camera shots, angles, and movements that align with the chosen video style." },
        audio: { type: Type.STRING, description: "Description of the diegetic sound environment." },
        sfx: { type: Type.STRING, description: "Specific sound effects to be used." },
        dialogue: { type: Type.STRING, description: "Dialogue spoken by characters. CRITICAL: You MUST use the format 'CHARACTER NAME: [Dialogue]'. The Character Name MUST EXACTLY MATCH the name used in 'characterDescription' so the video AI knows who is speaking." },
        music: { type: Type.STRING, description: "Description of the background music or score, fitting the video style." },
    },
    required: ["sceneNumber", "shortDescription", "videoStyle", "countryContext", "characterDescription", "visuals", "camera", "audio", "sfx", "dialogue", "music"],
};

const fullSchema = {
  type: Type.OBJECT,
  properties: {
    scenes: {
      type: Type.ARRAY,
      description: "An array of all the generated scenes for the video.",
      items: sceneSchema
    }
  },
  required: ["scenes"]
};

const systemInstruction = `You are 'VEO 3 Prompt Director', an expert AI screenwriter and film director. Your task is to generate highly detailed, cinematic prompts for individual scenes for the VEO 3 video generation model.
- CRITICAL LANGUAGE DIRECTIVE: The final output for the video generation model will be in English. Therefore, all descriptive text in all JSON fields (e.g., 'visuals', 'camera', 'audio', 'sfx', 'music', 'characterDescription', 'videoStyle', 'countryContext') MUST be written in ENGLISH ONLY. This is a non-negotiable technical requirement. The ONLY exception is the 'dialogue' field, which MUST be written in the specific language requested by the user.
- CHARACTER-VISUAL LINKING (CRITICAL): To ensure the video generation model correctly attributes dialogue to the right character, you MUST explicitly link the character's name to their visual description in the 'characterDescription' field. Start every character entry with their name in UPPERCASE, followed by a colon.
  Example:
  - LAN: A young woman wearing a white Ao Dai.
  - TUAN: A man in a green shirt.
- DIALOGUE ATTRIBUTION: Ensure the names used in the 'dialogue' field match the names defined in 'characterDescription' EXACTLY. Use the format 'CHARACTER NAME: [dialogue]'.
- DIALOGUE PACING: Dialogue is extremely time-sensitive. A character can typically speak about 15-20 words of dialogue comfortably in 8 seconds. You MUST ensure the dialogue you write is concise and can be realistically spoken within the 8-second scene limit. Do not write long monologues. Dialogue should be short and impactful.
- ACCENT CONSISTENCY: If the user specifies a regional accent (e.g., Northern or Southern Vietnamese), you MUST ensure all dialogue for all characters consistently uses that one accent.
- CRITICAL RULE: Each scene you generate must represent exactly 8 seconds of video. All action, dialogue, and camera movements must be paced to fit within this 8-second timeframe.
- SAFETY & POLICY COMPLIANCE: All generated content must be safe and appropriate for a general audience. Strictly avoid generating prompts that depict or suggest graphic violence, hate speech, harassment, explicit sexual content, self-harm, or any other content that would violate Google's Generative AI Prohibited Use Policy.
- VISUALS RULE: Do not include any burned-in subtitles, text overlays, or on-screen graphics in your visual descriptions unless explicitly requested in the user's story description. The final video should be clean of text.
- Character Consistency: For the 'characterDescription' field, provide a complete and detailed breakdown for EACH character in the scene (age, gender, clothing, facial features, specific actions, and current emotions). ABSOLUTELY DO NOT use shorthand like 'same as before' or 'same attire'. You MUST re-describe every character in full for every scene using the 'NAME: Description' format.
- The output MUST be a valid JSON object that strictly adheres to the provided schema.`;

export const suggestStoryDetails = async (
  briefDescription: string,
  language: string,
  duration: string,
  includeDialogue: boolean,
): Promise<string> => {
  const ai = getGenAI();
  const systemInstruction = `You are a creative co-writer and story consultant for a film director. Your task is to take a brief, high-level story idea and expand it into a more detailed and compelling narrative summary.
- Flesh out the plot with a clear beginning, middle, and end.
- Add details about the main characters' motivations and potential conflicts.
- Describe the setting and atmosphere to establish a strong mood.
- SAFETY & POLICY COMPLIANCE: The generated story summary must be safe for a general audience. Avoid creating narratives centered around graphic violence, hate speech, explicit content, or other topics that violate Google's Generative AI Prohibited Use Policy.
- CRITICAL: The entire summary MUST be written in ${language}.
- The output should be a single block of text, written in a clear and engaging style, which the director can then use as a more detailed input for generating scene-by-scene prompts.`;

  const userPrompt = `Here is my brief story idea. Please expand it into a detailed narrative summary for a short film.
---
Brief Idea: "${briefDescription}"
---
Constraints for the suggestion:
- Desired Duration: ${duration || 'Not specified'}. Please craft a story that can be realistically told within this timeframe.
- Include Dialogue: ${includeDialogue ? 'Yes, please weave key moments of sample dialogue into the narrative summary to bring the characters to life.' : 'No, focus only on the narrative description of events and characters.'}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error suggesting story details:", error);
    throw new Error("The AI model failed to suggest story details. Please try again.");
  }
};

export const generateCinematicPrompts = async ({
  description,
  duration,
  autoSplit,
  country,
  languages,
  videoStyle,
  noSinging,
  characterProfiles,
  accent,
  fullDialogue,
  sceneCount,
}: {
  description: string;
  duration: string;
  autoSplit: boolean;
  country: string;
  languages: string;
  videoStyle: string;
  noSinging: boolean;
  characterProfiles: CharacterProfile[];
  accent: string;
  fullDialogue: boolean;
  sceneCount: string;
}): Promise<Scene[]> => {
  const ai = getGenAI();
  
  if (videoStyle === PREHISTORIC_STYLE || videoStyle === SURVIVAL_STYLE) {
    description = `The main character IS a prehistoric human (Homo habilis). The entire story MUST revolve around this character and have an ancient survival atmosphere. The user's story idea is: "${description}"`;
  }
  
  const baseConstraints = [
    `1.  Timing: Each scene prompt MUST be designed for an 8-second video clip. The amount of dialogue and action must be realistically achievable in 8 seconds.`,
    `2.  Video Style: The overall aesthetic MUST be '${videoStyle}'. IMPORTANT: If the style is provided with a translation (e.g., 'Điện ảnh (Cinematic)'), you MUST use the English term ('Cinematic') in your descriptions and in the 'videoStyle' field. Every single generated scene must reflect this style.`,
    `3.  Country Context: Tailor the content, visuals, and any subtle references to be engaging for an audience in: ${country}.`,
    `4.  Dialogue Language: Dialogue MUST be in the following language: ${languages}. If 'Default', choose the most appropriate language based on the context. If 'No Dialogue', the dialogue field should be empty or 'N/A'.`,
    `5.  Auto-split scenes: ${autoSplit ? 'Yes, determine the number and content of scenes logically based on the story and desired duration.' : 'No, treat the entire description as a single scene.'}`,
    `6.  No Subtitles: The generated video must be completely free of any burned-in text or subtitles on the screen. Do not describe any text in the 'visuals' field.`
  ];
  
  if (videoStyle === 'ASMR (Autonomous Sensory Meridian Response)') {
    baseConstraints.push(`${baseConstraints.length + 1}. ASMR STYLE ENFORCEMENT: The 'music' field for all scenes MUST be 'N/A' or describe complete silence. The audio should consist exclusively of environmental sounds, whispering, or gentle, detailed sounds (triggers). No musical score is allowed.`);
  }

  if (noSinging) {
    baseConstraints.push(`${baseConstraints.length + 1}. No-Singing Enforcement: Under no circumstances should any character sing. Normal spoken dialogue is still allowed. The music score must be purely instrumental.`);
  }

  if (accent && accent !== 'Mặc định') {
    baseConstraints.push(`${baseConstraints.length + 1}. ACCENT ENFORCEMENT: ALL characters MUST speak with a consistent '${accent}' accent throughout the entire video. Do not mix accents under any circumstances.`);
  }

  if (fullDialogue) {
    baseConstraints.push(`${baseConstraints.length + 1}. FULL DIALOGUE MODE: Generate significantly more dialogue in each scene. The scenes should be dialogue-heavy, focusing on conversations to drive the narrative forward. While each scene is still 8 seconds, prioritize filling that time with meaningful character interaction and speech.`);
  }

  const sceneCountNum = parseInt(sceneCount);
  let lengthPromptText = duration ? `Desired Duration: ${duration}` : 'Desired Duration: Not specified';

  if (!isNaN(sceneCountNum) && sceneCountNum > 0) {
    baseConstraints.push(`${baseConstraints.length + 1}. CRITICAL SCENE COUNT: You MUST generate exactly ${sceneCountNum} scenes. This is a strict, non-negotiable requirement and overrides any other duration-based estimation.`);
    const calculatedDuration = sceneCountNum * 8;
    lengthPromptText = `Target Scene Count: ${sceneCountNum} scenes (This is the primary directive).\nEstimated Total Duration: ~${calculatedDuration} seconds.`;
  }

  const characterTextDescriptions = characterProfiles
    .filter(p => p.name.trim() || p.description.trim())
    .map(p => `- ${p.name.trim() || 'Unnamed Character'}: ${p.description.trim() || 'No text description provided.'}`)
    .join('\n');


  let userPrompt = `Based on the following video overview, generate a sequence of scene prompts.
---
Video Overview: ${description}
${characterTextDescriptions ? `\nCharacter Descriptions (Text):\n${characterTextDescriptions}` : ''}
${lengthPromptText}
---
CRITICAL CONSTRAINTS:
${baseConstraints.join('\n')}
`;

  const imageParts: { inlineData: { data: string; mimeType: string; } }[] = [];
  const charactersWithImages = characterProfiles.filter(p => p.image && p.name);

  if (charactersWithImages.length > 0) {
      userPrompt += `
---
CHARACTER IMAGE REFERENCES:
The following characters MUST be described based on the provided images. Their physical appearance must be consistent with their image.
${charactersWithImages.map(p => `- ${p.name}`).join('\n')}
---`;
      
      for (const profile of charactersWithImages) {
          if (profile.image && profile.mimeType) {
              imageParts.push({
                  inlineData: {
                      data: profile.image,
                      mimeType: profile.mimeType,
                  }
              });
          }
      }
  }

  userPrompt += `\nGenerate the output following the JSON schema precisely. Remember that all descriptive fields must be in English, but the dialogue must be in the specified language. Ensure pacing and continuity.`;

  const contents = { parts: [{ text: userPrompt }, ...imageParts] };
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: fullSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed.scenes || [];
  } catch (error) {
    console.error("Error generating cinematic prompts:", error);
    throw new Error("The AI model failed to generate a valid response. Please check your API Key.");
  }
};

export const rewriteScene = async (
  sceneToRewrite: Scene,
  action: RewriteAction,
  formInputs: FormInputs,
  allScenes: Scene[],
): Promise<Scene> => {
  const ai = getGenAI();
  const actionInstruction = action === 'expand'
    ? 'Expand on the details of this scene. Make the descriptions for visuals, camera, and audio more elaborate and vivid, while keeping the core action the same.'
    : 'Create an alternative version of this scene. Change the events, dialogue, or outcome in a creative way, while still fitting into the overall story.';
    
  let videoOverview = formInputs.description;
  if (formInputs.videoStyle === PREHISTORIC_STYLE || formInputs.videoStyle === SURVIVAL_STYLE) {
    videoOverview = `The main character IS a prehistoric human (Homo habilis). The entire story MUST revolve around this character and have an ancient survival atmosphere. The user's story idea is: "${formInputs.description}"`;
  }
  
  let finalDuration = formInputs.durationInMinutes ? `${formInputs.durationInMinutes} phút` : 'Not specified';

  const characterTextDescriptions = formInputs.characterProfiles
    .filter(p => p.name.trim() || p.description.trim())
    .map(p => `- ${p.name.trim() || 'Unnamed Character'}: ${p.description.trim() || 'No text description provided.'}`)
    .join('\n');

  const sceneCountNum = parseInt(formInputs.sceneCount);
  if (!isNaN(sceneCountNum) && sceneCountNum > 0) {
    const calculatedDuration = sceneCountNum * 8;
    finalDuration = `~${calculatedDuration} seconds`;
  }

  let userPrompt = `I need to rewrite a scene for a video with the following overall settings:
---
Video Overview: ${videoOverview}
${characterTextDescriptions ? `\nCharacter Descriptions (Text):\n${characterTextDescriptions}` : ''}
Video Style: ${formInputs.videoStyle}. IMPORTANT: If the style is provided with a translation (e.g., 'Điện ảnh (Cinematic)'), you MUST use the English term ('Cinematic') in your descriptions and in the 'videoStyle' field.
Desired Duration: ${finalDuration}
Country Context: ${formInputs.country}
Dialogue Language: ${formInputs.languages}
Accent Enforcement: ${formInputs.accent && formInputs.accent !== 'Mặc định' ? `Active. All dialogue MUST strictly adhere to a '${formInputs.accent}' accent.` : 'Inactive.'}
No-Singing Enforcement: ${formInputs.noSinging ? 'Active (No singing is allowed, but normal spoken dialogue is permitted. Music must be instrumental.)' : 'Inactive'}
Full Dialogue Mode: ${formInputs.fullDialogue ? 'Active. This scene should be dialogue-heavy, with a focus on conversation.' : 'Inactive.'}
---
Here is the original scene data:
${JSON.stringify(sceneToRewrite, null, 2)}
---`;

  const previousScenes = allScenes.filter(s => s.sceneNumber < sceneToRewrite.sceneNumber);
  if (previousScenes.length > 0) {
      userPrompt += `
---
CHARACTER CONTEXT FROM PREVIOUS SCENES:
To ensure consistency, here are the character descriptions from the scenes leading up to this one. The rewritten scene's characters MUST be consistent with these established descriptions, unless a story-driven change is necessary (like a change of clothes).
${previousScenes.map(s => `- Scene ${s.sceneNumber} Characters: ${s.characterDescription}`).join('\n')}
---`;
  }

  userPrompt += `Your task: ${actionInstruction}
- Maintain the scene number (${sceneToRewrite.sceneNumber}).
- The rewritten scene MUST adhere to the overall Video Style: '${formInputs.videoStyle}'.
- CRITICAL: Ensure the rewritten scene still adheres to the 8-second duration rule. All action and dialogue must be paced to 8 seconds.
- CHARACTER CONSISTENCY: Your rewritten scene must be consistent with the characters established in the previous scenes (context provided above) and the reference images if any. Provide a full description for every character in this scene. You MUST use the 'NAME: Description' format for each character.
- Dialogue Format: Ensure all dialogue is detailed and clearly attributed to a character using 'CHARACTER NAME: [dialogue]'.
- Country Context: Reflect the '${formInputs.country}' context.
- No Subtitles: The rewritten scene must not include any request for burned-in text or subtitles. The visuals must not contain any text.
- SAFETY: Ensure the rewritten scene remains fully compliant with Google's safety policies and avoids all prohibited content.
- CRITICAL: Adhere to all overall settings, including the Accent, No-Singing Enforcement, and Full Dialogue Mode rules if they are active.
${formInputs.videoStyle === 'ASMR (Autonomous Sensory Meridian Response)' ? `- ASMR STYLE ENFORCEMENT: The 'music' field MUST be 'N/A' or describe complete silence. The audio should consist exclusively of environmental sounds, whispering, or gentle, detailed sounds (triggers). No musical score is allowed.` : ''}
- Ensure your new version maintains continuity with the potential overall story.`;

  const imageParts: { inlineData: { data: string; mimeType: string; } }[] = [];
  const charactersWithImages = formInputs.characterProfiles.filter(p => p.image && p.name);

  if (charactersWithImages.length > 0) {
      userPrompt += `
---
CHARACTER IMAGE REFERENCES:
The following characters MUST be described based on the provided images. Their physical appearance must be consistent with their image.
${charactersWithImages.map(p => `- ${p.name}`).join('\n')}
---`;
      
      for (const profile of charactersWithImages) {
          if (profile.image && profile.mimeType) {
              imageParts.push({
                  inlineData: {
                      data: profile.image,
                      mimeType: profile.mimeType,
                  }
              });
          }
      }
  }

  userPrompt += `\nGenerate the output as a single JSON object adhering to the provided schema. Remember the language rule: descriptive fields in English, dialogue in '${formInputs.languages}'. The 'shortDescription' must be in Vietnamese.`;

  const contents = { parts: [{ text: userPrompt }, ...imageParts] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
        temperature: 0.9,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Scene;
  } catch (error) {
    console.error(`Error rewriting scene ${sceneToRewrite.sceneNumber}:`, error);
    throw new Error(`The AI model failed to rewrite scene ${sceneToRewrite.sceneNumber}.`);
  }
};

export const translateScene = async (
  sceneToTranslate: Scene,
  targetLanguage: string,
): Promise<Scene> => {
  const ai = getGenAI();
  const systemInstruction = `You are an expert translator. Your task is to translate the text content of a JSON object representing a video scene into the specified target language.
- Translate all string values in the provided JSON object.
- DO NOT translate the JSON keys (e.g., 'videoStyle', 'sceneNumber').
- Maintain the exact same JSON structure.
- The 'sceneNumber' must remain an integer and unchanged.
- The output MUST be a valid JSON object that strictly adheres to the provided schema. Do not output anything else.`;

  const userPrompt = `Translate the following scene object into ${targetLanguage}.

Original Scene:
${JSON.stringify(sceneToTranslate, null, 2)}

Return only the translated JSON object.`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Use a faster model for translation
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: sceneSchema,
            temperature: 0.2,
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Scene;
  } catch (error) {
    console.error(`Error translating scene ${sceneToTranslate.sceneNumber}:`, error);
    throw new Error(`The AI model failed to translate scene ${sceneToTranslate.sceneNumber}.`);
  }
};

export const generateNextScene = async (
  prompt: string,
  allScenes: Scene[],
  formInputs: FormInputs,
): Promise<Scene> => {
  const ai = getGenAI();

  const characterTextDescriptions = formInputs.characterProfiles
    .filter(p => p.name.trim() || p.description.trim())
    .map(p => `- ${p.name.trim() || 'Unnamed Character'}: ${p.description.trim() || 'No text description provided.'}`)
    .join('\n');

  const nextSceneNumber = allScenes.length + 1;
  
  let videoOverview = formInputs.description;
  if (formInputs.videoStyle === PREHISTORIC_STYLE || formInputs.videoStyle === SURVIVAL_STYLE) {
    videoOverview = `The main character IS a prehistoric human (Homo habilis). The entire story MUST revolve around this character and have an ancient survival atmosphere. The user's story idea is: "${formInputs.description}"`;
  }
  
  let finalDuration = formInputs.durationInMinutes ? `${formInputs.durationInMinutes} phút` : 'Not specified';
  const sceneCountNum = parseInt(formInputs.sceneCount);
  if (!isNaN(sceneCountNum) && sceneCountNum > 0) {
    const calculatedDuration = sceneCountNum * 8;
    finalDuration = `~${calculatedDuration} seconds`;
  }

  let userPrompt = `I need to generate the NEXT scene in a sequence for a video with the following overall settings:
---
Video Overview: ${videoOverview}
${characterTextDescriptions ? `\nCharacter Descriptions (Text):\n${characterTextDescriptions}` : ''}
Video Style: ${formInputs.videoStyle}. IMPORTANT: If the style is provided with a translation (e.g., 'Điện ảnh (Cinematic)'), you MUST use the English term ('Cinematic') in your descriptions and in the 'videoStyle' field.
Desired Duration: ${finalDuration}
Country Context: ${formInputs.country}
Dialogue Language: ${formInputs.languages}
Accent Enforcement: ${formInputs.accent && formInputs.accent !== 'Mặc định' ? `Active. All dialogue MUST strictly adhere to a '${formInputs.accent}' accent.` : 'Inactive.'}
No-Singing Enforcement: ${formInputs.noSinging ? 'Active (No singing is allowed, but normal spoken dialogue is permitted. Music must be instrumental.)' : 'Inactive'}
Full Dialogue Mode: ${formInputs.fullDialogue ? 'Active. This scene should be dialogue-heavy, with a focus on conversation.' : 'Inactive.'}
---
Here is what the user wants for the next scene: "${prompt}"
---
CONTEXT - ALL PREVIOUS SCENES:
To ensure perfect continuity, here is the full data for all the scenes that have happened so far. The new scene must follow logically from these.
${JSON.stringify(allScenes, null, 2)}
---
Your task: Generate scene number ${nextSceneNumber}.
- The new scene MUST continue the story logically from the previous scenes.
- It MUST fulfill the user's request: "${prompt}".
- CRITICAL: Ensure the new scene still adheres to the 8-second duration rule. All action and dialogue must be paced to 8 seconds.
- CHARACTER CONSISTENCY: Your new scene must be consistent with the characters established in the previous scenes. Provide a full description for every character in this scene. You MUST use the 'NAME: Description' format for each character.
- The new scene MUST adhere to the overall Video Style: '${formInputs.videoStyle}'.
- Dialogue Format: Ensure all dialogue is detailed and clearly attributed to a character using 'CHARACTER NAME: [dialogue]'.
- Country Context: Reflect the '${formInputs.country}' context.
- No Subtitles: The new scene must not include any request for burned-in text or subtitles.
- SAFETY: Ensure the new scene remains fully compliant with Google's safety policies.
- CRITICAL: Adhere to all overall settings, including the Accent, No-Singing Enforcement, and Full Dialogue Mode rules if they are active.
${formInputs.videoStyle === 'ASMR (Autonomous Sensory Meridian Response)' ? `- ASMR STYLE ENFORCEMENT: The 'music' field MUST be 'N/A' or describe complete silence. The audio should consist exclusively of environmental sounds, whispering, or gentle, detailed sounds (triggers). No musical score is allowed.` : ''}`;

  const imageParts: { inlineData: { data: string; mimeType: string; } }[] = [];
  const charactersWithImages = formInputs.characterProfiles.filter(p => p.image && p.name);

  if (charactersWithImages.length > 0) {
      userPrompt += `
---
CHARACTER IMAGE REFERENCES:
The following characters MUST be described based on the provided images. Their physical appearance must be consistent with their image.
${charactersWithImages.map(p => `- ${p.name}`).join('\n')}
---`;
      
      for (const profile of charactersWithImages) {
          if (profile.image && profile.mimeType) {
              imageParts.push({
                  inlineData: {
                      data: profile.image,
                      mimeType: profile.mimeType,
                  }
              });
          }
      }
  }

  userPrompt += `\nGenerate the output as a single JSON object adhering to the provided schema for scene number ${nextSceneNumber}. Remember the language rule: descriptive fields in English, dialogue in '${formInputs.languages}'. The 'shortDescription' must be in Vietnamese.`;

  const contents = { parts: [{ text: userPrompt }, ...imageParts] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
        temperature: 0.85,
      },
    });
    
    const jsonText = response.text.trim();
    const newScene = JSON.parse(jsonText) as Scene;
    newScene.sceneNumber = nextSceneNumber;
    return newScene;
  } catch (error) {
    console.error(`Error generating next scene:`, error);
    throw new Error(`The AI model failed to generate the next scene.`);
  }
};

export const formatSceneForVeoPrompt = (scene: Scene): string => {
  const allParts = [
    scene.videoStyle && `A cinematic video in the style of ${scene.videoStyle}`,
    scene.countryContext && `set within a ${scene.countryContext} cultural context`,
    scene.visuals && `depicting: ${scene.visuals.replace(/\n/g, ' ')}`,
    scene.characterDescription && `The characters are described as: ${scene.characterDescription.replace(/\n/g, ' ')}`,
    scene.camera && `The camera work includes: ${scene.camera.replace(/\n/g, ' ')}`,
    (scene.audio || scene.sfx || scene.music) && `The sound design includes ${[
      scene.audio && `ambient audio of ${scene.audio.replace(/\n/g, ' ')}`,
      scene.sfx && `sound effects like ${scene.sfx.replace(/\n/g, ' ')}`,
      scene.music && `a background score that is ${scene.music.replace(/\n/g, ' ')}`
    ].filter(Boolean).join(', ')}`,
    (scene.dialogue && scene.dialogue.toLowerCase().trim() !== 'n/a' && scene.dialogue.trim() !== '') && `The dialogue is: "${scene.dialogue.replace(/\n/g, ' ')}"`,
  ];

  return allParts.filter(Boolean).join('. ').replace(/\.\s*\./g, '.').replace(/\s+/g, ' ').trim() + '.';
};

export const formatSceneForImagePrompt = (scene: Scene): string => {
  const style = scene.videoStyle;
  // Clean up text
  const action = scene.visuals.replace(/\n/g, ' ').trim();
  const characters = scene.characterDescription.replace(/\n/g, ' ').trim();
  const context = scene.countryContext ? `in a ${scene.countryContext} setting` : '';
  
  // Extract lighting/mood from camera if possible, or generic
  let mood = "cinematic lighting";
  if (scene.camera.toLowerCase().includes("dark")) mood = "dark, moody lighting";
  if (scene.camera.toLowerCase().includes("bright")) mood = "bright, natural lighting";
  
  // Construct the prompt optimized for Logic and Character Consistency
  // We explicitly link the Action to the Character Description
  return `A high-quality, ${style} cinematic film still ${context}. ` +
         `The scene depicts: ${action}. ` +
         `Character Appearance (Must be consistent): ${characters}. ` +
         `Atmosphere: ${mood}, 8k resolution, highly detailed, storytelling composition, photorealistic.`;
};


export const generateVideoFromScene = async (scene: Scene): Promise<string> => {
  try {
    const freshAi = getGenAI();
    const prompt = formatSceneForVeoPrompt(scene);

    let operation = await freshAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await freshAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video generation completed, but no download link was found.");
    }

    // Use the same key logic for fetching the video
    const apiKey = getApiKey();
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch video blob:", errorText);
        if (response.status === 404 || errorText.includes("Requested entity was not found")) {
             throw new Error("API key is invalid or not found. Please select a valid API key and try again.");
        }
        throw new Error(`Failed to download the generated video. Status: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error(`Error generating video for scene ${scene.sceneNumber}:`, error);
    if (error.message && (error.message.includes("Requested entity was not found.") || error.message.includes("API key is invalid"))) {
        throw new Error("API key is invalid or not found. Please select a valid API key and try again.");
    }
    throw new Error(`The AI model failed to generate the video for scene ${scene.sceneNumber}. Details: ${error.message}`);
  }
};

export const generateImageFromScene = async (scene: Scene): Promise<string> => {
    try {
        const freshAi = getGenAI();
        const prompt = formatSceneForImagePrompt(scene);
        
        const response = await freshAi.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        
        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) {
            throw new Error("No image data returned.");
        }
        
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error: any) {
        console.error(`Error generating image for scene ${scene.sceneNumber}:`, error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
}