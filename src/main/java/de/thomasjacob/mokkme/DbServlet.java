package de.thomasjacob.mokkme;

import com.google.gson.Gson;

import de.thomasjacob.mokkme.entity.Mock;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;


/**
 * @author Thomas
 */
public class DbServlet extends HttpServlet
{
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		String pathInfo = request.getPathInfo();
		if (pathInfo.startsWith("/e/"))
		{
			Mock mock = Mock.byEditId(pathInfo.substring(3));
			if (mock != null)
			{
				mock.trackView();
			}
			writeMockResponse(response, mock);
		}
		else if (pathInfo.startsWith("/v/"))
		{
			Mock mock = Mock.byViewId(pathInfo.substring(3));
			if (mock != null)
			{
				mock.trackView();
			}
			writeMockResponse(response, mock);
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			response.setContentLength(0);
		}
	}

	@Override
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		String pathInfo = request.getPathInfo();
		if (pathInfo.equals("/e") || pathInfo.startsWith("/e/"))
		{
			String editId;
			if (pathInfo.length() > 3)
			{
				editId = pathInfo.substring(3);
			}
			else
			{
				editId = null;
			}

			Mock databaseMock = editId != null ? Mock.byEditId(editId) : new Mock();
			if (databaseMock == null)
			{
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.setContentLength(0);
				return;
			}

			Mock requestMock = readMockRequest(request);
			databaseMock.setPages(requestMock.getPages());
			databaseMock.save();
			writeMockResponse(response, databaseMock);
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			response.setContentLength(0);
		}
	}

	private Mock readMockRequest(HttpServletRequest request) throws IOException, UnsupportedEncodingException
	{
		byte[] requestBytes = IOUtils.toByteArray(request.getInputStream());
		String requestString =
			new String(requestBytes, StringUtils.defaultString(request.getCharacterEncoding(), "UTF-8"));
		return Mock.byJson(requestString);
	}

	private void writeMockResponse(HttpServletResponse response, Mock mock) throws UnsupportedEncodingException,
		IOException
	{
		if (mock != null)
		{
			Gson gson = new Gson();
			String mockJson = gson.toJson(mock);
			byte[] mockJsonBytes = mockJson.getBytes("UTF-8");
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("text/json; charset=UTF-8");
			response.setContentLength(mockJsonBytes.length);
			IOUtils.write(mockJsonBytes, response.getOutputStream());
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			response.setContentLength(0);
		}
	}
}
