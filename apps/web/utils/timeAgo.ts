export const timeAgo = (dt: string) => {
  let date = new Date(dt);
  
  //@ts-ignore
  let seconds = Math.floor((new Date() - date) / 1000);
  let intervalType = 'secs ago';
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = 'yrs ago';
    if (interval == 1) {
      intervalType = 'yr ago';
    }
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = 'mons ago';
      if (interval == 1) {
        intervalType = 'mon ago';
      }
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = 'days ago';
        if (interval == 1) {
          intervalType = 'day ago';
        }
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = 'hrs ago';
          if (interval == 1) {
            intervalType = 'hr ago';
          }
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = 'mins ago';
            if (interval == 1) {
              intervalType = 'min ago';
            }
          } else {
            if (seconds >= 45 && seconds < 60) {
              interval = seconds;
              intervalType = 'secs ago';
            } else {
              interval = seconds;
              intervalType = 'Just now';
            }
          }
        }
      }
    }
  }
  return `${seconds < 45 ? '' : interval ? interval : ''} ${intervalType}`;
};