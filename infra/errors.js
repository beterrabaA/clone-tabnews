class InternalServerError extends Error {
  constructor({ cause, code }) {
    super(
      "Um erro interno não esperado aconteceu. Tente novamente mais tarde.",
      {
        cause,
      },
    );
    this.name = "InternalServerError";
    this.statusCode = code || 500;
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

class ServiceUnavailableError extends Error {
  constructor({ cause, message }) {
    super(
      message ||
        "O serviço está temporariamente indisponível. Tente novamente mais tarde.",
      {
        cause,
      },
    );
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
    this.action =
      "Serviço indisponível no momento. Se o problema persistir, entre em contato com o suporte.";
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

class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não permitido para este endpoint.");
    this.name = "MethodNotAllowedError";
    this.statusCode = 405;
    this.action =
      "Verifique se o método HTTP utilizado é permitido para este endpoint e corrija a requisição.";
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

class ValidationError extends Error {
  constructor({ message, cause, action }) {
    super(message || "Dados de entrada inválidos.", { cause });
    this.name = "ValidationError";
    this.statusCode = 400;
    this.action =
      action ||
      "Verifique os dados enviados e corrija os erros indicados para prosseguir.";
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

class NotFoundError extends Error {
  constructor({ message, cause, action }) {
    super(message || "Recurso não encontrado.", { cause });
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.action =
      action ||
      "Verifique se o recurso existe e se a URL está correta, e tente novamente.";
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

const erros = {
  InternalServerError,
  ServiceUnavailableError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
};

export default erros;
