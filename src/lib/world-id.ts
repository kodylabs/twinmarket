export const WORLD_ID_ACTION = 'verify-humanity';

export function getWorldIdAppId(): `app_${string}` {
  const appId = process.env.NEXT_PUBLIC_WLD_APP_ID;
  if (!appId?.startsWith('app_')) {
    throw new Error('NEXT_PUBLIC_WLD_APP_ID must be set and start with "app_"');
  }
  return appId as `app_${string}`;
}
