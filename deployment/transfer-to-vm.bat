@echo off
REM ==============================================================================
REM Script: transfer-to-vm.bat
REM Descrição: Transfere scripts de deployment do Windows para a VM GCP
REM Autor: Gerado via AI Workflow
REM Data: 2025-11-12
REM ==============================================================================

echo.
echo ==================================================
echo TRANSFERIR SCRIPTS PARA VM - SECRETARIA ONLINE
echo ==================================================
echo.

REM Configurações (EDITE ESTAS VARIÁVEIS)
set VM_USER=naturalbahia
set VM_HOST=secretaria-online
set VM_DEST=/home/naturalbahia/

REM Verificar se SSH está disponível
where ssh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] SSH nao encontrado! Instale o OpenSSH ou use Git Bash.
    echo.
    pause
    exit /b 1
)

REM Verificar se SCP está disponível
where scp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] SCP nao encontrado! Instale o OpenSSH ou use Git Bash.
    echo.
    pause
    exit /b 1
)

echo [INFO] Configuracoes:
echo   Usuario: %VM_USER%
echo   Host: %VM_HOST%
echo   Destino: %VM_DEST%
echo.

REM Verificar conexão com a VM
echo [INFO] Testando conexao com a VM...
ssh -o ConnectTimeout=5 -o BatchMode=yes %VM_USER%@%VM_HOST% exit 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Nao foi possivel conectar automaticamente.
    echo [AVISO] Voce precisara digitar a senha durante a transferencia.
    echo.
)

echo [INFO] Transferindo arquivos...
echo.

REM Transferir scripts
echo [1/5] Transferindo setup-vm.sh...
scp setup-vm.sh %VM_USER%@%VM_HOST%:%VM_DEST%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao transferir setup-vm.sh
    goto error
)

echo [2/5] Transferindo deploy-app.sh...
scp deploy-app.sh %VM_USER%@%VM_HOST%:%VM_DEST%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao transferir deploy-app.sh
    goto error
)

echo [3/5] Transferindo manage-app.sh...
scp manage-app.sh %VM_USER%@%VM_HOST%:%VM_DEST%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao transferir manage-app.sh
    goto error
)

echo [4/5] Transferindo .env.production.example...
scp .env.production.example %VM_USER%@%VM_HOST%:%VM_DEST%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao transferir .env.production.example
    goto error
)

echo [5/5] Transferindo nginx.conf.example...
scp nginx.conf.example %VM_USER%@%VM_HOST%:%VM_DEST%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao transferir nginx.conf.example
    goto error
)

echo.
echo ==================================================
echo TRANSFERENCIA CONCLUIDA COM SUCESSO!
echo ==================================================
echo.
echo Proximos passos:
echo.
echo 1. Conecte a VM via SSH:
echo    ssh %VM_USER%@%VM_HOST%
echo.
echo 2. De permissao de execucao aos scripts:
echo    chmod +x *.sh
echo.
echo 3. Execute o setup da VM (primeira vez):
echo    bash setup-vm.sh
echo.
echo 4. Execute o deploy da aplicacao:
echo    bash deploy-app.sh
echo.
echo 5. Consulte o guia completo em: GUIA-DEPLOYMENT.md
echo.
pause
exit /b 0

:error
echo.
echo ==================================================
echo ERRO NA TRANSFERENCIA!
echo ==================================================
echo.
echo Verifique:
echo - Conexao com a VM
echo - Credenciais de acesso
echo - Nome do host ou IP
echo.
pause
exit /b 1
