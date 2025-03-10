// UserSelect.jsx
import AsyncSelect from "react-select/async";

const UserSelect = ({ value, onChange }) => {
  const loadOptions = async (inputValue) => {
    try {
      const response = await fetch(`/user/search?filter=${inputValue}`, {
        credentials: 'include' 
      });
      if (!response.ok) throw new Error('Erro na busca');
      const users = await response.json();
      return users.map((user) => ({ value: user.id, label: user.name }));
    } catch (err) {
      console.error('Falha ao buscar usuários:', err);
      return []; // Retorna vazio para não quebrar o componente
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      onChange={onChange}
      value={value}
      placeholder="Buscar usuário..."
      noOptionsMessage={() => "Nenhum usuário encontrado"}
      loadingMessage={() => "Carregando..."}
    />
  );
};

export default UserSelect;