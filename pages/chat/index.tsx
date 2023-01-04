import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Attachment,
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  LoadingIndicator,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'

// we'll reuse `useClient` hook from the "Add a Channel List" example
import { useClient } from 'hooks/useClient'

import 'stream-chat-react/dist/css/v2/index.css'

const userToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYmxhY2stc21va2UtNyJ9.csk8Vsl1n9BaMC454JaBXTvlVf_f91tKfggFy70MQn0'

const user = {
  id: 'black-smoke-7',
  name: 'black-smoke-7',
  image: 'https://getstream.io/random_png/?id=black-smoke-7&name=black-smoke-7',
}

const filters = { type: 'messaging', members: { $in: ['black-smoke-7'] } }
const sort = { last_message_at: -1 }

const attachments = [
  {
    image:
      'https://images-na.ssl-images-amazon.com/images/I/71k0cry-ceL._SL1500_.jpg',
    name: 'iPhone',
    type: 'product',
    url: 'https://goo.gl/ppFmcR',
  },
]

const CustomAttachment = (props) => {
  const { attachments } = props
  const [attachment] = attachments || []

  if (attachment?.type === 'product')
    return (
      <div>
        Product:
        <a href={attachment.url} rel="noreferrer">
          <img alt="custom-attachment" height="100px" src={attachment.image} />
          <br />
          {attachment.name}
        </a>
      </div>
    )

  return <Attachment {...props} />
}

const App = () => {
  const chatClient = useClient({
    apiKey: '4cytnuxs9mnj',
    userData: user,
    tokenOrProvider: userToken,
  })

  useEffect(() => {
    if (!chatClient) return

    const initAttachmentMessage = async () => {
      const [channelResponse] = await chatClient.queryChannels(filters, sort)

      await channelResponse.sendMessage({
        text: 'Your selected product is out of stock, would you like to select one of these alternatives?',
        attachments,
      })
    }

    initAttachmentMessage()
  }, [chatClient])

  if (!chatClient) {
    return <LoadingIndicator />
  }

  return (
    <Chat client={chatClient} theme="messaging light">
      <ChannelList filters={filters} />
      <Channel Attachment={CustomAttachment}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  )
}

export default App
