let token = "";

    // Referencias
    const adminPanel = document.getElementById("adminPanel");
    const userPanel = document.getElementById("userPanel");
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");

    // Botones cerrar sesión por panel
    const btnLogoutAdmin = document.getElementById("btnLogoutAdmin");
    const btnLogoutUser = document.getElementById("btnLogoutUser");

    // Registro
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: document.getElementById("nombre").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        }),
      });
      const mensaje = await res.text();
      alert(mensaje);
      formRegister.reset();
    });

    // Login
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("http://localhost:4000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.token) {
          alert("Login fallido. Verifica tus credenciales.");
          return;
        }

        token = data.token;

        const meRes = await fetch("http://localhost:4000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          alert("Error al obtener datos del usuario");
          return;
        }

        const user = await meRes.json();

        // Ocultar formularios
        formLogin.style.display = "none";
        formRegister.style.display = "none";

        if (user.rol === "admin") {
          const adminRes = await fetch("http://localhost:4000/admin", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const mensaje = await adminRes.text();
          adminPanel.style.display = "block";
          userPanel.style.display = "none";
          document.getElementById("adminContent").innerText = mensaje;
        } else if (user.rol === "usuario") {
          const userRes = await fetch("http://localhost:4000/usuario", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const mensaje = await userRes.text();
          userPanel.style.display = "block";
          adminPanel.style.display = "none";
          document.getElementById("userContent").innerText = mensaje;
        } else {
          alert("Rol desconocido");
          formLogin.style.display = "block";
          formRegister.style.display = "block";
        }
      } catch (error) {
        console.error("Error general:", error);
        alert("Ocurrió un error en el login");
      }
    });

    // Función para cerrar sesión general
    function cerrarSesion() {
      token = "";
      adminPanel.style.display = "none";
      userPanel.style.display = "none";
      formLogin.style.display = "block";
      formRegister.style.display = "block";

      formLogin.reset();
      formRegister.reset();
      document.getElementById("adminContent").innerText = "";
      document.getElementById("userContent").innerText = "";

      alert("Sesión cerrada correctamente.");
    }

    // Eventos botones cerrar sesión en cada panel
    btnLogoutAdmin.addEventListener("click", cerrarSesion);
    btnLogoutUser.addEventListener("click", cerrarSesion);