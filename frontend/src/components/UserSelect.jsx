// UserSelect.jsx
import AsyncSelect from "react-select/async";

const UserSelect = ({ value, onChange }) => {
  const loadOptions = async (inputValue) => {
    const response = await fetch(`/api/users?search=${inputValue}`);
    const users = await response.json();
    return users.map((user) => ({
      value: user.id,
      label: user.name,
    }));
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