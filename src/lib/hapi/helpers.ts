'use strict'
import config from '../config.ts'
import { Request, Response } from 'express'
import got from 'got'
import logger from '../logger.ts'

export function invalidBundle(resource): boolean {
  return (
    !resource.resourceType ||
    (resource.resourceType && resource.resourceType !== 'Bundle') ||
    !resource.entry ||
    (resource.entry && resource.entry.length === 0)
  )
}

export function invalidBundleMessage() {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'processing',
        diagnostics: 'Invalid bundle submitted',
      },
    ],
    response: {
      status: 400,
    },
  }
}

export async function hapiPassthrough(targetUri, res: Response): Promise<any> {
  logger.info(`Getting ${targetUri}`)

  const options = {
    username: config.get('fhirServer:username'),
    password: config.get('fhirServer:password'),
  }

  try {
    const result = await got.get(targetUri, options).json()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json(error)
  }
}

export async function hapiGet(resource: string, options): Promise<any> {
  const targetUri = config.get('fhirServer:baseURL') + '/' + resource
  
  logger.info(`Getting ${targetUri}`)

  // Merge options
  const sendOptions = {...options, username: config.get('fhirServer:username'), password: config.get('fhirServer:password')}

  try {
    const result = got.get(targetUri, sendOptions)
    
    return await result.json()
  } catch (error) {
    logger.error(`Could not get ${targetUri}:\n${JSON.stringify(error)}`)
    return null
  }
}

export function getHapiPassthrough() {
  return async (req: Request, res: Response) => {
    const targetUri = config.get('fhirServer:baseURL') + req.url

    return hapiPassthrough(targetUri, res)
  }
}

export function getMetadata() {
  return async (req: Request, res: Response) => {
    const targetUri = config.get('fhirServer:baseURL') + '/metadata'

    return hapiPassthrough(targetUri, res)
  }
}
