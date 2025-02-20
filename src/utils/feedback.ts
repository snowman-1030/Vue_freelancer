export const getFeedbackType = (message: string) => {
  console.log('Raw message:', message)
  if (message.includes('Type:')) {
    const type = message.split('Type:')[1].split('\n')[0].trim().toLowerCase()
    return type === 'bug' || type === 'feature' || type === 'support' ? type : 'other'
  }
  // First word of the message is the type
  const firstWord = message.split(' ')[0].toLowerCase()
  return firstWord === 'bug' || firstWord === 'feature' || firstWord === 'support' ? firstWord : 'other'
}

export const getMessageContent = (message: string) => {
  console.log('Processing message:', message)
  if (message.includes('Description:')) {
    const content = message.split('Description:')[1].trim()
    console.log('Found Description: prefix, content:', content)
    return content
  }
  // Get everything after the first word (the type)
  const content = message.split(' ').slice(1).join(' ').trim()
  console.log('Using first word split, content:', content)
  return content
}