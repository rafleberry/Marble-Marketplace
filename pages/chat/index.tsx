import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  VirtualizedMessageList,
  Window,
  MessageList,
} from 'stream-chat-react'

// we'll reuse `useClient` hook from the "Add a Channel List" example
import { useClient } from 'hooks/useClient'

import 'stream-chat-react/dist/css/v2/index.css'

const userToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYmx1ZS1zb3VuZC0wIn0.heAnux6VqC5SLRy3gdrU37YQY5y88cwiKSxJtEWn87k'

const user = {
  id: 'blue-sound-0',
  name: 'blue',
  image: 'https://getstream.io/random_png/?id=blue-sound-0&name=blue-sound-0',
}

const App = () => {
  const chatClient = useClient({
    apiKey: 'nn77pcugr4wt',
    userData: user,
    tokenOrProvider: userToken,
  })

  const [channel, setChannel] = useState(undefined)

  useEffect(() => {
    if (!chatClient || channel) return

    const spaceChannel = chatClient.channel('messaging', 'marble', {
      image: 'https://goo.gl/Zefkbx',
      name: 'Marble',
    })

    setChannel(spaceChannel)
  }, [chatClient])

  if (!chatClient) return null

  return (
    <Chat client={chatClient} theme="str-chat__theme-dark">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader live />
          <MessageList />
          <MessageInput focus />
        </Window>
      </Channel>
    </Chat>
  )
}

export default App
