class InternalServerError extends Error {
  constructor({ cause }) {
    super(
      "Um erro interno não esperado aconteceu. Tente novamente mais tarde.",
      {
        cause,
      },
    );
    this.name = "InternalServerError";
    this.statusCode = 500;
    this.action = "Se o erro persistir, entre em contato com o suporte.";
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status_code: this.statusCode,
      action: this.action,
    };
  }
}

export { InternalServerError };
