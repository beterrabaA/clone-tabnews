export function DatabaseStatus({ version, maxConnections, openConnections }) {
  return (
    <>
      <h1>Database Status</h1>
      {version ? (
        <>
          <div>Versão: {version}</div>
          <div>Conexões abertas: {openConnections}</div>
          <div>Conexões Máximas: {maxConnections}</div>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </>
  );
}
