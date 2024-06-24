import nconf from 'nconf'

const env = process.env.NODE_ENV || 'ci'

nconf.argv().env().file(`${__dirname}/../config/${env}.config`)

export { nconf as config }
export default nconf