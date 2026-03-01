export const ENV = "DEV";
export const UASAM_ENDPOINT = "http://localhost:8000";
export const GOVERNOR_ENDPOINT = "http://localhost:8008";

export const SIGN_UP_V1_INIT_ENDPOINT = UASAM_ENDPOINT + "/api/user/v1/create/";

export const USER_AUTHENTICATE_V1_ENDPOINT =
  UASAM_ENDPOINT + "/api/user/v1/authenticate/";

export const USER_FIELDS_EDIT_V1_ENDPOINT =
  UASAM_ENDPOINT + "/api/user/v1/edit/";

export const GET_NOTIFICATIONS_V1_INIT_ENDPOINT =
  UASAM_ENDPOINT + "/v1/notification/list/";

export const READ_NOTIFICATIONS_V1_INIT_ENDPOINT =
  UASAM_ENDPOINT + "/v1/notification/read/";

export const PASSWORD_RESET_V1_INIT_ENDPOINT =
  UASAM_ENDPOINT + "/v1/user/reset-password/init/";

export const PASSWORD_RESET_V1_RESET_ENDPOINT =
  UASAM_ENDPOINT + "/v1/user/reset-password/reset/";

export const LOGIN_V1_VERIFY_PASSWORD_ENDPOINT =
  UASAM_ENDPOINT + "/v1/user/login/verify-password/";

export const USER_PYTHON_ALGORITHM_RUNS_V1_ENDPOINT =
  GOVERNOR_ENDPOINT + "/v1/user/algorithm/runs/";

export const PASSWORD_UPDATE_V1_ENDPOINT =
  UASAM_ENDPOINT + "/api/user/v1/reset-password/update/";

export const CREATE_PROJECT_ENDPOINT =
  UASAM_ENDPOINT + "/api/project/v1/create/";

export const PROJECT_LIST_ENDPOINT = UASAM_ENDPOINT + "/api/project/v1/list/";

export const BACKEND_SDK_KEY_CREATE_ENDPOINT =
  UASAM_ENDPOINT + "/api/project/v1/sdk/backend/key/create/";
