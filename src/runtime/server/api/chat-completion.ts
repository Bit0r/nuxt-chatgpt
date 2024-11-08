import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from "h3"
import OpenAI from 'openai'
import { MODEL_GPT_4_MINI } from '../../constants/models'
import { defaultOptions } from "../../constants/options"
import { modelMap } from "../../utils/model-map"

export default defineEventHandler(async (event) => {
  // destructing the data that comes from the request
  const { messages, model, options } = await readBody(event)

  const config = useRuntimeConfig()

  // throw an error if the apiKey is not set
  if (!config.chatgpt.apiKey) {
    throw createError({
      statusCode: 403,
      message: 'Missing OpenAI API Key',
    })
  }

  // set-up configuration object and apiKEY
  const openai = new OpenAI({
    apiKey: config.chatgpt.apiKey,
    baseURL: config.chatgpt.baseURL
  });

  /**
   * Create request options object
   * @description if the model is not defined by the user it will be used the default one - gpt-3.5-turbo
  */
  const requestOptions = {
    messages,
    model: !model ? modelMap[MODEL_GPT_4_MINI] : modelMap[model],
    ...(options || defaultOptions)
  }

  /**
   * @return response
  */
  try {
    const chatCompletion = await openai.chat.completions.create(requestOptions)
    return chatCompletion.choices
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to forward request to OpenAI API',
    })
  }
})
