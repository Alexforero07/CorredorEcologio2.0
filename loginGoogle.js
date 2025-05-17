    function handleCredentialResponse(response) {
      // Decodificar el JWT (solo para prueba; en producción se debe verificar en el backend)
      const data = parseJwt(response.credential);
      console.log("Datos del usuario:", data);
      document.getElementById("user-info").innerText =
        `Hola, ${data.name} (${data.email})`;
    }

    function parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }