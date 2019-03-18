import Redirect from 'umi/redirect';
import { GetGlobalToken } from '@/utils/cache';

export default ({ children }) => {
  let token = GetGlobalToken();

  if (token) {
    return children;
  } else {
    return <Redirect to="/login" />;
  }
};