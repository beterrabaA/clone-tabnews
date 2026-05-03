export function UpdatedAt({ timestamp }) {
  const date = new Date(timestamp).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  let updatedAtText = "Carregando...";
  if (timestamp) {
    updatedAtText = `Atualizado em: ${date}`;
  }

  return <div>{updatedAtText}</div>;
}
