import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pbUrl = PUBLIC_POCKETBASE_URL ;

const pb = new PocketBase(pbUrl);

export default pb;
