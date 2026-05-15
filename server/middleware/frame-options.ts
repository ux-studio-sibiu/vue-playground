export default defineEventHandler((event) => {
  removeResponseHeader(event, 'X-Frame-Options')
  setResponseHeader(event, 'Content-Security-Policy', 'frame-ancestors *')
})
