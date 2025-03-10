import AsyncSelect from "react-select/async";

const UserSelect = ({ onChange }) => {
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
      cacheOptions       // Cache para requisições repetidas
      loadOptions={loadOptions}  // Função que busca os dados
      onChange={onChange}        // Callback quando selecionar um item
    />
  );
};