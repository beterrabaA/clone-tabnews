function status(request, response) {
  return response.status(200).json({ message: "Hello world status" });
}

export default status;
