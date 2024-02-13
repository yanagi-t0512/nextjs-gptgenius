'use server';
import OpenAI from 'openai';
import prisma from './db';
import { revalidatePath } from 'next/cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (chatMessage) => {
  // console.log('openaiチャットメッセージ:', chatMessage);
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'you are a helpful assistant',
        },
        ...chatMessage,
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0,
      max_tokens: 100,
    });
    // console.log('レスポンス:', response.choices[0].message);
    return {
      message: response.choices[0].message,
      tokens: response.usage.total_tokens
    }
  } catch (error) {
    return null
  }
};


export const generateTourResponse = async ({city, country}) => {
  const query = `
  入力した都道府県（${country}）から、市（${city}）を見つけます。
もし、${country}と${city} が存在し、かつ、
この ${country}の${city} で、観光旅行ができるスポットのリストを作成します。
リストができたら、1日のツアーを作成します。応答は以下のJSON形式である必要があります：
{
"tour": {
"city": "${city}",
"country": "${country}",
"title": "ツアーのタイトル",
"description": "都市とツアーの短い説明",
"stops": ["観光スポット1の短い説明文", "観光スポット2の短い説明文", "観光スポット3の短い説明文"]
}
}
"stops" プロパティには具体的な場所も示して下さい。
正確な ${city} の情報を見つけられない場合、または ${city} が存在せず、人口が1未満の場合、
または次の ${country} に位置していない場合は、{ "tour": null } を返します。
追加の文字は含みません。
  `

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'あなたはベテランのツアーガイドです'
        },
        {
          role: 'user',
          content: query
        }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0,
    })
    const tourData = JSON.parse(response.choices[0].message.content)
    if(!tourData.tour){
      return null
    }
    return {tour: tourData.tour, tokens: response.usage.total_tokens}
  } catch (error) {
    console.log(error)
    return null
  }
};


export const getExistingTour = async ({city, country}) => {
  return prisma.tour.findUnique({
    where: {
      city_country: {
        city, country
      }
    }
  })
};


export const createNewTour = async (tour) => {
  return prisma.tour.create({
    data: tour,
  })
};


export const getALLTours = async (searchTerm) => {
  if(!searchTerm){
    const tours = await prisma.tour.findMany({
      orderBy: {
        city: 'asc'
      }
    })
    return tours
  }
  console.log('検索するのは:', searchTerm)
  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
          },
        },
        {
          country: {
            contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      city: 'asc'
    }
  })
  return tours
}


export const getSingleTour = async (id) => {
  return prisma.tour.findUnique({
    where: {
      id,
    },
  })
}


export const generateTourImage = async ({city, country}) => {
  try {
    const tourImage = await openai.images.generate({
      prompt: `${country} ${city} のパノラマビュー`,
      n:1,
      size: '512x512'
    })
    return tourImage?.data[0]?.url
  } catch (error) {
    return null
  }
}


export const fetchUserTokensById = async(clerkId) => {
  const result = await prisma.token.findUnique({
    where: {
      clerkId
    }
  })
  return result?.tokens
}


export const generateUserTokenForId = async (clerkId) => {
  const result = await prisma.token.create({
    data: {
      clerkId,
    }
  })
  return result?.tokens
}


export const fetchOrGenerateTokens = async (clerkId) => {
  const result = await fetchUserTokensById(clerkId)
  if(result){
    return result.tokens
  }
  return (await generateUserTokenForId(clerkId)).tokens
}


export const subtractTokens = async (clerkId, tokens) => {
  const result = await prisma.token.update({
    where: {
      clerkId
    },
    data: {
      tokens: {
        decrement: tokens
      }
    }
  })
  revalidatePath('/profile')
  return result.tokens
}