// For calling controllers internally
export const callController = (controller, requestBody) => {
  const mockRequest = {
    body: requestBody,
  };

  return new Promise((resolve, reject) => {
    const mockResponse = {
      json: (data) => resolve(data),
      status: (statusCode) => ({
        send: (error) => reject({ statusCode, error }),
      }),
    };

    controller(mockRequest, mockResponse);
  });
};
