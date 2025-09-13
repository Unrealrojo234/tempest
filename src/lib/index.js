import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

const pbUrl = env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

const pb = new PocketBase(pbUrl);

export default pb;
